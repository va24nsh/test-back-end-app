import { Op } from 'sequelize';
import { LoggerFactory } from '@adapters';
import { ConflictError, NotFoundError, ValidationError } from '@errors';
import {
  ClinicalReport,
  ConsentAccessLog,
  ConsentItem,
  ConsentItemTimeline,
  ConsentRequest,
  Doctor,
  User,
} from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { ConsentValidationSchemas } from '@validators';
import {
  buildConsentItemResponse,
  buildConsentRequestResponse,
  buildDoctorResponse,
  buildReportSummary,
  getActiveConsentTextSnapshot,
  parseJsonScope,
  PROFILE_SECTION_LABELS,
} from '@utils/consent-utils';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('ConsentsController');

const getUserId = async (req: ExtendedRequest): Promise<string> => {
  const userId = req.userId || req.user?.id;
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await User.findByPk(userId);
  if (!user || !user.dataValues.isActive) {
    throw new NotFoundError('User not found');
  }

  return userId;
};

const getDoctor = async (doctorId: string): Promise<Doctor> => {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor || doctor.dataValues.status !== 'ACTIVE') {
    throw new NotFoundError('Doctor not found');
  }

  return doctor;
};

const buildGrantedScope = (requestType: string, requestScope: Record<string, unknown>) => ({
  type: requestType,
  ...requestScope,
});

const buildReportWhere = (userId: string, requestType: string, requestScope: Record<string, unknown>) => {
  const where: Record<string, unknown> = { userId };
  const reportIds = Array.isArray(requestScope.reportIds) ? (requestScope.reportIds as string[]) : [];
  const reportTypes = Array.isArray(requestScope.reportTypes) ? (requestScope.reportTypes as string[]) : [];
  const dateRange = requestScope.dateRange && typeof requestScope.dateRange === 'object' ? (requestScope.dateRange as Record<string, unknown>) : null;

  if (reportIds.length > 0) {
    where.id = { [Op.in]: reportIds };
  }

  if (reportTypes.length > 0) {
    where.reportType = { [Op.in]: reportTypes };
  }

  if (requestType === 'DATE_RANGE' && dateRange) {
    const range: Record<string, unknown> = {};
    if (dateRange.fromDate) {
      range[Op.gte as unknown as string] = dateRange.fromDate;
    }
    if (dateRange.toDate) {
      range[Op.lte as unknown as string] = dateRange.toDate;
    }
    where.reportDate = range;
  }

  return where;
};

const expandConsentItems = async (userId: string, doctor: Doctor, requestType: string, requestScope: Record<string, unknown>, consentRequestId: string) => {
  const items: Array<Record<string, unknown>> = [];

  if (requestType === 'FULL_REPORT' || requestType === 'DATE_RANGE' || requestType === 'SPECIFIC') {
    const reports = await ClinicalReport.findAll({ where: buildReportWhere(userId, requestType, requestScope) });
    reports.forEach((report) => {
      items.push({
        consentRequestId,
        doctorId: doctor.dataValues.id,
        externalDoctorId: doctor.dataValues.externalDoctorId || null,
        userId,
        itemType: 'REPORT',
        itemId: report.dataValues.id,
        reportType: report.dataValues.reportType,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'USER',
        careProcessingConsent: true,
        trainingConsent: false,
      });
    });
  }

  if (requestType === 'FULL_PROFILE' || requestType === 'SPECIFIC_SECTIONS') {
    const sections = requestType === 'FULL_PROFILE'
      ? Object.keys(PROFILE_SECTION_LABELS)
      : Array.isArray(requestScope.profileSections)
        ? (requestScope.profileSections as string[])
        : [];

    sections.forEach((sectionKey) => {
      items.push({
        consentRequestId,
        doctorId: doctor.dataValues.id,
        externalDoctorId: doctor.dataValues.externalDoctorId || null,
        userId,
        itemType: 'PROFILE_SECTION',
        itemId: sectionKey,
        reportType: null,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'USER',
        careProcessingConsent: true,
        trainingConsent: false,
      });
    });
  }

  return items;
};

const createTimelineEntries = async (requestId: string, items: ConsentItem[], eventType: string, actorType: string, actorId: string, eventDescription: string) => {
  if (items.length === 0) {
    return;
  }

  await ConsentItemTimeline.bulkCreate(
    items.map((item) => ({
      consentItemId: item.dataValues.id,
      consentRequestId: requestId,
      eventType,
      eventDescription,
      actorType,
      actorId,
      oldStatus: null,
      newStatus: item.dataValues.status,
      oldValues: null,
      newValues: null,
      eventTimestamp: new Date(),
    }))
  );
};

const loadConsentRequestForUser = async (id: string, userId: string) => {
  const request = await ConsentRequest.findOne({ where: { id, userId } });
  if (!request) {
    throw new NotFoundError('Consent request not found');
  }

  const doctor = await Doctor.findByPk(request.dataValues.doctorId);
  return { request, doctor };
};

const deriveActiveScope = (items: ConsentItem[]) => {
  const activeItems = items.filter((item) => item.dataValues.status === 'APPROVED');
  const reportTypes = [...new Set(activeItems.filter((item) => item.dataValues.itemType === 'REPORT').map((item) => item.dataValues.reportType).filter(Boolean) as string[])];
  const reportIds = activeItems.filter((item) => item.dataValues.itemType === 'REPORT').map((item) => item.dataValues.itemId);
  const profileSections = activeItems.filter((item) => item.dataValues.itemType === 'PROFILE_SECTION').map((item) => item.dataValues.itemId);

  return {
    type: activeItems.some((item) => item.dataValues.itemType === 'REPORT') && activeItems.some((item) => item.dataValues.itemType === 'PROFILE_SECTION')
      ? 'BOTH'
      : activeItems.some((item) => item.dataValues.itemType === 'REPORT')
        ? 'REPORTS'
        : 'PROFILE',
    reportTypes,
    reportIds,
    profileSections,
  };
};

const revokeItems = async (items: ConsentItem[], revokedBy: string) => {
  const revokedAt = new Date();
  for (const item of items) {
    await item.update({ status: 'REVOKED', revokedAt, revokedBy });
  }

  return revokedAt;
};

const updateParentRequestsAfterRevocation = async (items: ConsentItem[], revokedAt: Date) => {
  const requestIds = [...new Set(items.map((item) => item.dataValues.consentRequestId))];
  for (const requestId of requestIds) {
    const request = await ConsentRequest.findByPk(requestId);
    if (!request) {
      continue;
    }

    const requestItems = await ConsentItem.findAll({ where: { consentRequestId: request.dataValues.id } });
    const activeItems = requestItems.filter((entry) => entry.dataValues.status === 'APPROVED');
    await request.update({
      grantedScope: deriveActiveScope(activeItems),
      status: activeItems.length === 0 ? 'REVOKED' : request.dataValues.status,
      revokedAt: activeItems.length === 0 ? revokedAt : request.dataValues.revokedAt,
      revokedBy: activeItems.length === 0 ? 'USER' : request.dataValues.revokedBy,
    });
  }
};

export const consentsController = {
  create: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const body = ConsentValidationSchemas.validate<{
        doctorId: string;
        requestedAccessType: 'REPORTS' | 'PROFILE' | 'BOTH';
        requestType: 'FULL_REPORT' | 'DATE_RANGE' | 'SPECIFIC' | 'FULL_PROFILE' | 'SPECIFIC_SECTIONS';
        requestScope: Record<string, unknown>;
        requestMessage?: string | null;
        careProcessingConsent: boolean;
        trainingConsent: boolean;
      }>(ConsentValidationSchemas.createConsentRequestBody, req.body);

      const doctor = await getDoctor(body.doctorId);
      const snapshot = await getActiveConsentTextSnapshot();
      const requestScope = parseJsonScope(body.requestScope);
      const request = await ConsentRequest.create({
        doctorId: doctor.dataValues.id,
        externalDoctorId: doctor.dataValues.externalDoctorId || null,
        userId,
        source: 'SELF',
        requestedAccessType: body.requestedAccessType,
        requestType: body.requestType,
        requestScope,
        requestMessage: body.requestMessage || null,
        status: 'APPROVED',
        grantedScope: buildGrantedScope(body.requestType, requestScope),
        careProcessingConsent: body.careProcessingConsent,
        trainingConsent: body.trainingConsent,
        userConsentTimestamp: new Date(),
        ...snapshot,
      });

      const itemPayloads = await expandConsentItems(userId, doctor, body.requestType, requestScope, request.dataValues.id);
      const createdItems = itemPayloads.length > 0 ? await ConsentItem.bulkCreate(itemPayloads as any, { returning: true }) : [];
      await createTimelineEntries(request.dataValues.id, createdItems, 'APPROVED', 'USER', userId, 'Consent granted by patient');

      res.sendResponse(buildConsentRequestResponse(request, doctor), 'Consent request created successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'create' });
    }
  },

  getAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const query = ConsentValidationSchemas.validate<{ status: 'PENDING' | 'APPROVED'; page: number; limit: number }>(ConsentValidationSchemas.consentRequestQuery, req.query as Record<string, unknown>);

      const requests = await ConsentRequest.findAll({ where: { userId, status: query.status }, order: [['createdAt', 'DESC']] });
      const offset = (query.page - 1) * query.limit;
      const items = requests.slice(offset, offset + query.limit);
      const doctors = await Doctor.findAll({ where: { id: { [Op.in]: items.map((request) => request.dataValues.doctorId) } } as any });
      const doctorMap = new Map(doctors.map((doctor) => [doctor.dataValues.id, doctor]));

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items: items.map((request) => buildConsentRequestResponse(request, doctorMap.get(request.dataValues.doctorId) || null)),
          hasNextPage: offset + query.limit < requests.length,
          nextPage: offset + query.limit < requests.length ? query.page + 1 : null,
        },
        'Consent requests retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAll' });
    }
  },

  getById: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ id: string }>(ConsentValidationSchemas.consentRequestIdParams, req.params as Record<string, unknown>);
      const { request, doctor } = await loadConsentRequestForUser(params.id, userId);

      res.sendResponse(buildConsentRequestResponse(request, doctor || null), 'Consent request retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getById' });
    }
  },

  getRequestItems: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ id: string }>(ConsentValidationSchemas.consentRequestIdParams, req.params as Record<string, unknown>);
      const query = ConsentValidationSchemas.validate<{ page: number; limit: number }>(ConsentValidationSchemas.consentRequestItemsQuery, req.query as Record<string, unknown>);

      const { request } = await loadConsentRequestForUser(params.id, userId);
      const allItems = await ConsentItem.findAll({ where: { consentRequestId: request.dataValues.id }, order: [['createdAt', 'DESC']] });
      const offset = (query.page - 1) * query.limit;
      const items = allItems.slice(offset, offset + query.limit);
      const reports = await ClinicalReport.findAll({ where: { id: { [Op.in]: items.filter((item) => item.dataValues.itemType === 'REPORT').map((item) => item.dataValues.itemId) } } as any });
      const reportMap = new Map(reports.map((report) => [report.dataValues.id, report]));

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items: items.map((item) => buildConsentItemResponse(item, reportMap.get(item.dataValues.itemId) || null)),
          hasNextPage: offset + query.limit < allItems.length,
          nextPage: offset + query.limit < allItems.length ? query.page + 1 : null,
        },
        'Consent request items retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getRequestItems' });
    }
  },

  respond: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ id: string }>(ConsentValidationSchemas.consentRequestIdParams, req.params as Record<string, unknown>);
      const body = ConsentValidationSchemas.validate<{
        action: 'APPROVE' | 'REJECT';
        approvedRequestType?: string;
        approvedScope?: Record<string, unknown>;
        careProcessingConsent: boolean;
        trainingConsent: boolean;
      }>(ConsentValidationSchemas.consentRespondBody, req.body);

      const { request, doctor } = await loadConsentRequestForUser(params.id, userId);
      if (request.dataValues.status !== 'PENDING') {
        throw new ConflictError('Consent request is not respondable');
      }

      if (body.action === 'REJECT') {
        await request.update({ status: 'REJECTED', userConsentTimestamp: new Date(), careProcessingConsent: body.careProcessingConsent, trainingConsent: body.trainingConsent });
        res.sendResponse(buildConsentRequestResponse(request, doctor || null), 'Consent request rejected successfully');
        return;
      }

      const approvedRequestType = body.approvedRequestType || request.dataValues.requestType;
      const approvedScope = parseJsonScope(body.approvedScope);
      const itemPayloads = await expandConsentItems(userId, doctor || await getDoctor(request.dataValues.doctorId), approvedRequestType, approvedScope, request.dataValues.id);
      const createdItems = itemPayloads.length > 0 ? await ConsentItem.bulkCreate(itemPayloads as any, { returning: true }) : [];
      await createTimelineEntries(request.dataValues.id, createdItems, 'APPROVED', 'USER', userId, 'Consent approved by patient');

      const grantedScope = buildGrantedScope(approvedRequestType, approvedScope);
      const status = approvedRequestType === request.dataValues.requestType && JSON.stringify(approvedScope) === JSON.stringify(parseJsonScope(request.dataValues.requestScope)) ? 'APPROVED' : 'PARTIALLY_APPROVED';

      await request.update({ status, grantedScope, userConsentTimestamp: new Date(), careProcessingConsent: body.careProcessingConsent, trainingConsent: body.trainingConsent });

      res.sendResponse(buildConsentRequestResponse(request, doctor || null), 'Consent request updated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'respond' });
    }
  },

  revoke: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ id: string }>(ConsentValidationSchemas.consentRequestIdParams, req.params as Record<string, unknown>);
      const { request } = await loadConsentRequestForUser(params.id, userId);
      const items = await ConsentItem.findAll({ where: { consentRequestId: request.dataValues.id, status: 'APPROVED' } });
      const revokedAt = await revokeItems(items, 'USER');
      await updateParentRequestsAfterRevocation(items, revokedAt);
      await request.update({ status: 'REVOKED', revokedAt, revokedBy: 'USER' });

      res.sendResponse({ id: request.dataValues.id, status: request.dataValues.status, revokedAt }, 'Consent request revoked successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revoke' });
    }
  },

  getDoctors: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const query = ConsentValidationSchemas.validate<{ page: number; limit: number }>(ConsentValidationSchemas.consentDoctorsQuery, req.query as Record<string, unknown>);

      const items = await ConsentItem.findAll({ where: { userId, status: 'APPROVED' } });
      const doctorIds = [...new Set(items.map((item) => item.dataValues.doctorId))];
      const doctors = doctorIds.length > 0 ? await Doctor.findAll({ where: { id: { [Op.in]: doctorIds } } as any }) : [];
      const accessLogs = doctorIds.length > 0 ? await ConsentAccessLog.findAll({ where: { userId, doctorId: { [Op.in]: doctorIds } } as any }) : [];

      const grouped = doctorIds.map((doctorId) => {
        const doctor = doctors.find((entry) => entry.dataValues.id === doctorId);
        if (!doctor) {
          return null;
        }

        const doctorItems = items.filter((item) => item.dataValues.doctorId === doctorId);
        const doctorLogs = accessLogs.filter((log) => log.dataValues.doctorId === doctorId);

        return {
          doctor: buildDoctorResponse(doctor),
          activeReportsCount: doctorItems.filter((item) => item.dataValues.itemType === 'REPORT').length,
          activeProfileSectionsCount: doctorItems.filter((item) => item.dataValues.itemType === 'PROFILE_SECTION').length,
          lastAccessAt: doctorLogs.sort((left, right) => new Date(right.dataValues.accessedAt).getTime() - new Date(left.dataValues.accessedAt).getTime())[0]?.dataValues.accessedAt || null,
        };
      }).filter(Boolean) as Array<Record<string, unknown>>;

      const offset = (query.page - 1) * query.limit;
      const pageItems = grouped.slice(offset, offset + query.limit);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items: pageItems,
          hasNextPage: offset + query.limit < grouped.length,
          nextPage: offset + query.limit < grouped.length ? query.page + 1 : null,
        },
        'Doctors with access retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getDoctors' });
    }
  },

  getTimeline: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const query = ConsentValidationSchemas.validate<{ page: number; limit: number }>(ConsentValidationSchemas.consentDoctorsQuery, req.query as Record<string, unknown>);

      const requestIds = (await ConsentRequest.findAll({ where: { userId } })).map((request) => request.dataValues.id);
      const timelineRows = requestIds.length > 0
        ? await ConsentItemTimeline.findAll({ where: { consentRequestId: { [Op.in]: requestIds } } as any, order: [['eventTimestamp', 'DESC']] })
        : [];

      const items = await ConsentItem.findAll({ where: { userId } });
      const doctors = items.length > 0 ? await Doctor.findAll({ where: { id: { [Op.in]: items.map((item) => item.dataValues.doctorId) } } as any }) : [];
      const reportIds = items.filter((item) => item.dataValues.itemType === 'REPORT').map((item) => item.dataValues.itemId);
      const reports = reportIds.length > 0 ? await ClinicalReport.findAll({ where: { id: { [Op.in]: reportIds } } as any }) : [];

      const itemMap = new Map(items.map((item) => [item.dataValues.id, item]));
      const doctorMap = new Map(doctors.map((doctor) => [doctor.dataValues.id, doctor]));
      const reportMap = new Map(reports.map((report) => [report.dataValues.id, report]));

      const responseItems = timelineRows.map((row) => {
        const item = itemMap.get(row.dataValues.consentItemId);
        const doctor = item ? doctorMap.get(item.dataValues.doctorId) : null;
        const report = item && item.dataValues.itemType === 'REPORT' ? reportMap.get(item.dataValues.itemId) || null : null;

        return {
          id: row.dataValues.id,
          eventType: row.dataValues.eventType,
          eventDescription: row.dataValues.eventDescription || null,
          actorType: row.dataValues.actorType,
          actorId: row.dataValues.actorId || null,
          oldStatus: row.dataValues.oldStatus || null,
          newStatus: row.dataValues.newStatus || null,
          oldValues: row.dataValues.oldValues || null,
          newValues: row.dataValues.newValues || null,
          ipAddress: row.dataValues.ipAddress || null,
          deviceInfo: row.dataValues.deviceInfo || null,
          geoLocation: row.dataValues.geoLocation || null,
          eventTimestamp: row.dataValues.eventTimestamp,
          doctor: doctor ? buildDoctorResponse(doctor) : null,
          itemType: item?.dataValues.itemType || null,
          itemId: item?.dataValues.itemId || null,
          report: report ? buildReportSummary(report) : null,
          profileSection: item?.dataValues.itemType === 'PROFILE_SECTION' ? { key: item.dataValues.itemId, label: PROFILE_SECTION_LABELS[item.dataValues.itemId] || item.dataValues.itemId } : null,
        };
      });

      const offset = (query.page - 1) * query.limit;
      const pageItems = responseItems.slice(offset, offset + query.limit);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items: pageItems,
          hasNextPage: offset + query.limit < responseItems.length,
          nextPage: offset + query.limit < responseItems.length ? query.page + 1 : null,
        },
        'Consent timeline retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getTimeline' });
    }
  },

  getConsentItems: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const query = ConsentValidationSchemas.validate<{ doctorId: string; page: number; limit: number }>(ConsentValidationSchemas.consentItemsQuery, req.query as Record<string, unknown>);

      const doctor = await getDoctor(query.doctorId);
      const allItems = await ConsentItem.findAll({ where: { userId, doctorId: doctor.dataValues.id }, order: [['approvedAt', 'DESC']] });
      const reportIds = allItems.filter((item) => item.dataValues.itemType === 'REPORT').map((item) => item.dataValues.itemId);
      const reports = reportIds.length > 0 ? await ClinicalReport.findAll({ where: { id: { [Op.in]: reportIds } } as any }) : [];
      const reportMap = new Map(reports.map((report) => [report.dataValues.id, report]));
      const offset = (query.page - 1) * query.limit;
      const pageItems = allItems.slice(offset, offset + query.limit);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items: pageItems.map((item) => buildConsentItemResponse(item, reportMap.get(item.dataValues.itemId) || null)),
          hasNextPage: offset + query.limit < allItems.length,
          nextPage: offset + query.limit < allItems.length ? query.page + 1 : null,
        },
        'Consent items retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getConsentItems' });
    }
  },

  revokeConsentItem: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ id: string }>(ConsentValidationSchemas.consentItemIdParams, req.params as Record<string, unknown>);
      const item = await ConsentItem.findOne({ where: { id: params.id, userId } });
      if (!item) {
        throw new NotFoundError('Consent item not found');
      }

      const revokedAt = await revokeItems([item], 'USER');
      await updateParentRequestsAfterRevocation([item], revokedAt);

      res.sendResponse({ id: item.dataValues.id, status: 'REVOKED', revokedAt }, 'Consent item revoked successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revokeConsentItem' });
    }
  },

  revokeDoctorReports: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ doctorId: string }>(ConsentValidationSchemas.revokeDoctorParams, req.params as Record<string, unknown>);
      const doctor = await getDoctor(params.doctorId);
      const items = await ConsentItem.findAll({ where: { userId, doctorId: doctor.dataValues.id, itemType: 'REPORT', status: 'APPROVED' } });
      const revokedAt = await revokeItems(items, 'USER');
      await ConsentItemTimeline.bulkCreate(items.map((item) => ({ consentItemId: item.dataValues.id, consentRequestId: item.dataValues.consentRequestId, eventType: 'REVOKED', eventDescription: 'Report access revoked by patient', actorType: 'USER', actorId: userId, oldStatus: 'APPROVED', newStatus: 'REVOKED', eventTimestamp: revokedAt })));
      await updateParentRequestsAfterRevocation(items, revokedAt);

      res.sendResponse({ doctorId: doctor.dataValues.id, revokedItemsCount: items.length }, 'Doctor reports revoked successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revokeDoctorReports' });
    }
  },

  revokeDoctorProfileSections: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ doctorId: string }>(ConsentValidationSchemas.revokeDoctorParams, req.params as Record<string, unknown>);
      const doctor = await getDoctor(params.doctorId);
      const items = await ConsentItem.findAll({ where: { userId, doctorId: doctor.dataValues.id, itemType: 'PROFILE_SECTION', status: 'APPROVED' } });
      const revokedAt = await revokeItems(items, 'USER');
      await ConsentItemTimeline.bulkCreate(items.map((item) => ({ consentItemId: item.dataValues.id, consentRequestId: item.dataValues.consentRequestId, eventType: 'REVOKED', eventDescription: 'Profile section access revoked by patient', actorType: 'USER', actorId: userId, oldStatus: 'APPROVED', newStatus: 'REVOKED', eventTimestamp: revokedAt })));
      await updateParentRequestsAfterRevocation(items, revokedAt);

      res.sendResponse({ doctorId: doctor.dataValues.id, revokedItemsCount: items.length }, 'Doctor profile sections revoked successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revokeDoctorProfileSections' });
    }
  },

  revokeDoctorAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = await getUserId(req);
      const params = ConsentValidationSchemas.validate<{ doctorId: string }>(ConsentValidationSchemas.revokeDoctorParams, req.params as Record<string, unknown>);
      const doctor = await getDoctor(params.doctorId);
      const items = await ConsentItem.findAll({ where: { userId, doctorId: doctor.dataValues.id, status: 'APPROVED' } });
      const revokedAt = await revokeItems(items, 'USER');
      await ConsentItemTimeline.bulkCreate(items.map((item) => ({ consentItemId: item.dataValues.id, consentRequestId: item.dataValues.consentRequestId, eventType: 'REVOKED', eventDescription: 'Consent revoked by patient', actorType: 'USER', actorId: userId, oldStatus: 'APPROVED', newStatus: 'REVOKED', eventTimestamp: revokedAt })));
      await updateParentRequestsAfterRevocation(items, revokedAt);

      res.sendResponse({ doctorId: doctor.dataValues.id, revokedItemsCount: items.length }, 'All doctor consent items revoked successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revokeDoctorAll' });
    }
  },
};

