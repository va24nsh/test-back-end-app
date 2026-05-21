import { Op } from 'sequelize';
import { LoggerFactory } from '@adapters';
import { NotFoundError, ValidationError, ConflictError } from '@errors';
import { ClinicalReport, ClinicalReportAnalytics } from '@models';
import { ConsentItem, ConsentItemTimeline, ConsentRequest, Doctor } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { ClinicalReportValidationSchemas } from '@validators';
import { handleControllerError } from '@utils/errorHandler';
import { ALL_REPORT_TYPE_KEYS } from '@constants';

const logger = new LoggerFactory().createLogger('ClinicalReportsController');

const buildAnalyticsResponse = (analytics?: ClinicalReportAnalytics | null) => ({
  riskLevel: analytics?.riskLevel ?? null,
  analysisDate: analytics?.analysisDate ?? null,
  keyFindingsSummary: analytics?.keyFindingsSummary ?? null,
  recommendations: analytics?.recommendations ?? null,
  extractedData: analytics?.extractedData ?? null,
  keyFindings: analytics?.keyFindings ?? null,
  abnormalValues: analytics?.abnormalValues ?? null,
});

const buildReportResponse = (report: ClinicalReport & { analytics?: ClinicalReportAnalytics | null }) => ({
  id: report.dataValues.id,
  reportType: report.dataValues.reportType,
  description: report.dataValues.description ?? null,
  reportDate: report.dataValues.reportDate,
  uploadedDate: report.dataValues.uploadedDate,
  fileUrl: report.dataValues.fileUrl,
  fileMimeType: report.dataValues.fileMimeType ?? null,
  fileSizeBytes: report.dataValues.fileSizeBytes ?? null,
  labName: report.dataValues.labName ?? null,
  doctorName: report.dataValues.doctorName ?? null,
  isAnalyzed: report.dataValues.isAnalyzed,
  analysisStatus: report.dataValues.analysisStatus ?? null,
  ...buildAnalyticsResponse(report.analytics ?? null),
  createdAt: report.dataValues.createdAt,
  updatedAt: report.dataValues.updatedAt,
});

const parseReportTypeFilter = (value?: string): string[] | undefined => {
  if (!value) {
    return undefined;
  }

  const values = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
};

const getUserId = (req: ExtendedRequest): string => {
  const userId = req.userId || req.user?.id;
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  return userId;
};

const loadReportWithAnalytics = async (id: string, userId: string) => {
  return ClinicalReport.findOne({
    where: { id, userId },
    include: [
      {
        model: ClinicalReportAnalytics,
        as: 'analytics',
      },
    ],
  });
};

export const clinicalReportsController = {
  getReportTypes: async (_req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      res.sendResponse(
        { items: ALL_REPORT_TYPE_KEYS },
        'Report types retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getReportTypes' });
    }
  },

  getHubCounts: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);

      const [totalReports, pendingAnalysisReports, criticalReports] = await Promise.all([
        ClinicalReport.count({ where: { userId } }),
        ClinicalReport.count({
          where: {
            userId,
            analysisStatus: { [Op.in]: ['PENDING', 'PROCESSING'] },
          },
        }),
        ClinicalReport.count({
          where: {
            userId,
            analysisStatus: 'COMPLETED',
          },
          include: [
            {
              model: ClinicalReportAnalytics,
              as: 'analytics',
              required: true,
              where: {
                riskLevel: { [Op.in]: ['HIGH', 'CRITICAL'] },
              },
            },
          ],
        }),
      ]);

      res.sendResponse(
        {
          totalReports,
          pendingAnalysisReports,
          criticalReports,
        },
        'Hub counts retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getHubCounts' });
    }
  },

  getAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const query = ClinicalReportValidationSchemas.validate<{
        page: number;
        limit: number;
        reportType?: string;
      }>(ClinicalReportValidationSchemas.clinicalReportListQuery, req.query as Record<string, unknown>);

      const reportTypes = parseReportTypeFilter(query.reportType);
      const offset = (query.page - 1) * query.limit;

      const whereClause: Record<string, unknown> = { userId };
      if (reportTypes && reportTypes.length > 0) {
        whereClause.reportType = { [Op.in]: reportTypes };
      }

      const { rows, count } = await ClinicalReport.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ClinicalReportAnalytics,
            as: 'analytics',
          },
        ],
        order: [
          ['uploadedDate', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        limit: query.limit,
        offset,
        distinct: true,
      });

      const items = rows.map((report) => buildReportResponse(report));
      const hasNextPage = offset + items.length < count;

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage,
          nextPage: hasNextPage ? query.page + 1 : null,
        },
        'Clinical reports retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAll' });
    }
  },

  getById: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );

      const report = await loadReportWithAnalytics(params.id, userId);
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      res.sendResponse(buildReportResponse(report), 'Clinical report retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getById' });
    }
  },

  getAnalytics: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      if (report.dataValues.analysisStatus !== 'COMPLETED') {
        throw new ConflictError('ANALYSIS_NOT_READY');
      }

      const analytics = await ClinicalReportAnalytics.findOne({ where: { clinicalReportId: report.dataValues.id } });
      if (!analytics) {
        throw new NotFoundError('Analytics not found');
      }

      // Build flattened extractedValues and keyFindings
      const extractedSource = analytics.extractedData || analytics.abnormalValues || analytics.keyFindings || {};

      const coerceNumber = (v: unknown): number | null => {
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        if (typeof v === 'string') {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      };

      const coerceString = (v: unknown): string | null => {
        if (typeof v === 'string') return v;
        if (typeof v === 'number' && Number.isFinite(v)) return String(v);
        return null;
      };

      const extractEntries = (source: unknown): Array<{ metricName: string; raw: Record<string, unknown> }> => {
        if (!source || typeof source !== 'object') return [];
        if (Array.isArray(source)) {
          return source.flatMap((item, idx) => {
            if (!item || typeof item !== 'object') return [];
            const raw = item as Record<string, unknown>;
            const metricName = coerceString(raw.metricName) || coerceString(raw.name) || `metric-${idx + 1}`;
            return [{ metricName, raw }];
          });
        }

        return Object.entries(source as Record<string, unknown>).map(([metricName, rawValue]) => {
          if (rawValue && typeof rawValue === 'object') {
            return { metricName, raw: rawValue as Record<string, unknown> };
          }
          return { metricName, raw: { current: { value: rawValue } } };
        });
      };

      const extractMetric = (raw: Record<string, unknown>) => {
        const currentObj = raw.current && typeof raw.current === 'object' ? (raw.current as Record<string, unknown>) : {};
        const currentValue = coerceNumber(currentObj.value) ?? coerceString(currentObj.value) ?? null;
        const currentUnit = coerceString(currentObj.unit) ?? null;

        const rangeObj = (raw.expectedRange && typeof raw.expectedRange === 'object' ? raw.expectedRange : raw.range) as any;
        const expectedRange = rangeObj
          ? { min: coerceNumber(rangeObj.min) ?? null, max: coerceNumber(rangeObj.max) ?? null, unit: coerceString(rangeObj.unit) ?? null }
          : null;

        const risk = coerceString(raw.riskLevel) || coerceString(raw.severity) || null;

        return { current: { value: currentValue, unit: currentUnit }, expectedRange, riskLevel: risk };
      };

      const entries = extractEntries(analytics.extractedData || analytics.keyFindings || analytics.abnormalValues || []);

      const extractedValues = entries.map(({ metricName, raw }) => {
        const { current, expectedRange, riskLevel } = extractMetric(raw);
        return {
          metricName,
          current,
          expectedRange,
          isAbnormal: Boolean(riskLevel),
          riskLevel: riskLevel || null,
        };
      });

      const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      extractedValues.sort((a, b) => {
        const sa = a.riskLevel ? severityOrder[a.riskLevel] ?? 99 : 99;
        const sb = b.riskLevel ? severityOrder[b.riskLevel] ?? 99 : 99;
        if (sa !== sb) return sa - sb;
        return a.metricName.localeCompare(b.metricName);
      });

      const abnormalItemsCount = extractedValues.filter((v) => v.isAbnormal).length;

      const analyticsSummary = {
        normalItemsCount: extractedValues.length - abnormalItemsCount,
        abnormalItemsCount,
        totalExtractedItemsCount: extractedValues.length,
      };

      const keyFindings = (() => {
        const kf = analytics.keyFindings as unknown;
        if (!kf) return [];
        const entriesKF: Array<{ metricName: string; raw: Record<string, unknown> }> = [];
        if (Array.isArray(kf)) {
          (kf as any[]).forEach((item, idx) => {
            if (!item || typeof item !== 'object') return;
            entriesKF.push({ metricName: (item.metricName as string) || `metric-${idx + 1}`, raw: item as Record<string, unknown> });
          });
        } else if (typeof kf === 'object') {
          Object.entries(kf as Record<string, unknown>).forEach(([metricName, raw]) => {
            if (raw && typeof raw === 'object') entriesKF.push({ metricName, raw: raw as Record<string, unknown> });
          });
        }

        return entriesKF.map((entry) => {
          const { current, expectedRange } = extractMetric(entry.raw);
          return {
            metricName: entry.metricName,
            current,
            expectedRange,
            riskLevel: coerceString(entry.raw.riskLevel) || coerceString(entry.raw.severity) || null,
          };
        });
      })();

      res.sendResponse({ analyticsSummary, keyFindings, extractedValues }, 'Clinical report analytics retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAnalytics' });
    }
  },

  retryAnalysis: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      if (report.dataValues.analysisStatus !== 'FAILED') {
        throw new ConflictError('Only FAILED reports can be retried');
      }

      await report.update({ analysisStatus: 'PROCESSING', isAnalyzed: false });

      // remove existing analytics if present
      await ClinicalReportAnalytics.destroy({ where: { clinicalReportId: report.dataValues.id } });

      // TODO: enqueue background job to re-run analysis (out of scope)

      res.sendResponse({ id: report.dataValues.id, analysisStatus: 'PROCESSING' }, 'Retry started');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'retryAnalysis' });
    }
  },

  getConsentTimeline: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );
      const query = ClinicalReportValidationSchemas.validate<{ page: number; limit: number }>(
        ClinicalReportValidationSchemas.clinicalReportListQuery,
        req.query as Record<string, unknown>
      );

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      const ConsentItem = (await import('@models/consentItem.model')).ConsentItem;
      const ConsentItemTimeline = (await import('@models/consentItemTimeline.model')).ConsentItemTimeline;
      const Doctor = (await import('@models/doctor.model')).Doctor;

      const consentItems = await ConsentItem.findAll({ where: { userId, itemType: 'REPORT', itemId: params.id } });
      const itemIds = consentItems.map((ci: any) => ci.id);

      const offset = (query.page - 1) * query.limit;
      const rows = await ConsentItemTimeline.findAll({ where: { consentItemId: itemIds }, order: [['eventTimestamp', 'DESC']], limit: query.limit + 1, offset });

      const items = await Promise.all(
        rows.slice(0, query.limit).map(async (row: any) => {
          let doctor = null;
          if (row.actorType === 'DOCTOR' && row.actorId) {
            const d = await Doctor.findByPk(row.actorId as string);
            if (d) {
              doctor = {
                id: d.dataValues.id,
                externalDoctorId: d.dataValues.externalDoctorId || null,
                firstName: d.dataValues.firstName,
                lastName: d.dataValues.lastName,
                specialization: d.dataValues.specialization || null,
                hospitalName: d.dataValues.hospitalName || null,
                profilePicture: d.dataValues.profilePicture || null,
                status: d.dataValues.status || null,
                isVerified: d.dataValues.isVerified || false,
              };
            }
          }

          return {
            id: row.id,
            eventType: row.eventType,
            eventDescription: row.eventDescription || null,
            actorType: row.actorType,
            actorId: row.actorId || null,
            oldStatus: row.oldStatus || null,
            newStatus: row.newStatus || null,
            oldValues: row.oldValues || null,
            newValues: row.newValues || null,
            ipAddress: row.ipAddress || null,
            deviceInfo: row.deviceInfo || null,
            geoLocation: row.geoLocation || null,
            eventTimestamp: row.eventTimestamp,
            doctor,
          };
        })
      );

      const hasNextPage = rows.length > query.limit;

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage,
          nextPage: hasNextPage ? query.page + 1 : null,
        },
        'Consent timeline retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getConsentTimeline' });
    }
  },

  getAccessList: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );
      const query = ClinicalReportValidationSchemas.validate<{ page: number; limit: number }>(
        ClinicalReportValidationSchemas.clinicalReportListQuery,
        req.query as Record<string, unknown>
      );

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      const ConsentItem = (await import('@models/consentItem.model')).ConsentItem;
      const ConsentRequest = (await import('@models/consentRequest.model')).ConsentRequest;
      const ConsentItemTimeline = (await import('@models/consentItemTimeline.model')).ConsentItemTimeline;
      const Doctor = (await import('@models/doctor.model')).Doctor;

      const offset = (query.page - 1) * query.limit;
      const itemsRaw = await ConsentItem.findAll({ where: { userId, itemType: 'REPORT', itemId: params.id }, limit: query.limit + 1, offset });

      const items = await Promise.all(
        itemsRaw.slice(0, query.limit).map(async (item: any) => {
          const doctor = await Doctor.findByPk(item.doctorId);
          const consentRequest = await ConsentRequest.findByPk(item.consentRequestId);
          const lastEvent = await ConsentItemTimeline.findOne({ where: { consentItemId: item.id }, order: [['eventTimestamp', 'DESC']] });

          return {
            consentItemId: item.id,
            status: item.status,
            approvedAt: item.approvedAt || null,
            revokedAt: item.revokedAt || null,
            consentRequest: consentRequest
              ? {
                  source: consentRequest.source || null,
                  requestedAccessType: consentRequest.requestedAccessType || null,
                  requestType: consentRequest.requestType || null,
                  status: consentRequest.status || null,
                  userConsentTimestamp: consentRequest.userConsentTimestamp || null,
                  expiresAt: consentRequest.expiresAt || null,
                  revokedAt: consentRequest.revokedAt || null,
                }
              : null,
            lastTimelineEvent: lastEvent
              ? { eventType: lastEvent.eventType, eventTimestamp: lastEvent.eventTimestamp }
              : null,
            doctor: doctor
              ? {
                  id: doctor.dataValues.id,
                  externalDoctorId: doctor.dataValues.externalDoctorId || null,
                  firstName: doctor.dataValues.firstName,
                  lastName: doctor.dataValues.lastName,
                  specialization: doctor.dataValues.specialization || null,
                  hospitalName: doctor.dataValues.hospitalName || null,
                  profilePicture: doctor.dataValues.profilePicture || null,
                  status: doctor.dataValues.status || null,
                  isVerified: doctor.dataValues.isVerified || false,
                }
              : null,
          };
        })
      );

      const hasNextPage = itemsRaw.length > query.limit;
      res.sendResponse({ page: query.page, pageSize: query.limit, items, hasNextPage, nextPage: hasNextPage ? query.page + 1 : null }, 'Access list retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAccessList' });
    }
  },

  revokeAllAccess: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      const ConsentItem = (await import('@models/consentItem.model')).ConsentItem;
      const ConsentItemTimeline = (await import('@models/consentItemTimeline.model')).ConsentItemTimeline;
      const ConsentRequest = (await import('@models/consentRequest.model')).ConsentRequest;
      const { sequelize } = await import('@config/database');

      const t = await (sequelize as any).transaction();
      try {
        const approvedItems = await ConsentItem.findAll({ where: { userId, itemType: 'REPORT', itemId: params.id, status: 'APPROVED' }, transaction: t });
        let revokedItemsCount = 0;

        for (const item of approvedItems) {
          await item.update({ status: 'REVOKED', revokedAt: new Date(), revokedBy: 'USER' }, { transaction: t });
          await ConsentItemTimeline.create({
            consentItemId: item.id,
            consentRequestId: item.consentRequestId,
            eventType: 'REVOKED',
            eventDescription: `Access revoked by user`,
            actorType: 'USER',
            actorId: null,
            eventTimestamp: new Date(),
          } as any, { transaction: t });

          // update consent request status if needed
          const reqRec = await ConsentRequest.findByPk(item.consentRequestId, { transaction: t });
          if (reqRec) {
            // simplistic: set revoked if no approved items remain for this request
            const remaining = await ConsentItem.count({ where: { consentRequestId: reqRec.id, status: 'APPROVED' }, transaction: t });
            if (remaining === 0) {
              await reqRec.update({ status: 'REVOKED', revokedAt: new Date() }, { transaction: t });
            }
          }

          revokedItemsCount += 1;
        }

        await t.commit();
        res.sendResponse({ reportId: params.id, revokedItemsCount }, 'Access revoked for all doctors');
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'revokeAllAccess' });
    }
  },

  create: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const body = ClinicalReportValidationSchemas.validate<{
        reportType: string;
        description?: string | null;
        fileUrl: string;
        fileMimeType?: string | null;
        fileSizeBytes?: number;
        reportDate?: string;
        labName?: string | null;
        doctorName?: string | null;
      }>(ClinicalReportValidationSchemas.clinicalReportCreateBody, req.body);

      const uploadedDate = new Date().toISOString().slice(0, 10);
      const reportDate = body.reportDate ?? uploadedDate;

      const report = await ClinicalReport.create({
        userId,
        reportType: body.reportType,
        description: body.description ?? null,
        fileUrl: body.fileUrl,
        fileMimeType: body.fileMimeType ?? null,
        fileSizeBytes: body.fileSizeBytes ?? null,
        reportDate: new Date(reportDate),
        uploadedDate: new Date(uploadedDate),
        labName: body.labName ?? null,
        doctorName: body.doctorName ?? null,
        isAnalyzed: false,
        analysisStatus: 'PENDING',
      });

      const createdReport = await loadReportWithAnalytics(report.dataValues.id, userId);
      res.sendResponse(
        createdReport ? buildReportResponse(createdReport) : buildReportResponse(report),
        'Clinical report created successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'create' });
    }
  },

  update: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );
      const body = ClinicalReportValidationSchemas.validate<{
        reportType?: string;
        description?: string | null;
        fileUrl?: string;
        fileMimeType?: string | null;
        fileSizeBytes?: number;
        reportDate?: string;
        labName?: string | null;
        doctorName?: string | null;
        tags?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        isAnalyzed?: boolean;
        analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      }>(ClinicalReportValidationSchemas.clinicalReportUpdateBody, req.body);

      const report = await ClinicalReport.findOne({ where: { id: params.id, userId } });
      if (!report) {
        throw new NotFoundError('Clinical report not found');
      }

      await report.update({
        ...(body.reportType ? { reportType: body.reportType } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.fileUrl ? { fileUrl: body.fileUrl } : {}),
        ...(body.fileMimeType !== undefined ? { fileMimeType: body.fileMimeType } : {}),
        ...(body.fileSizeBytes !== undefined ? { fileSizeBytes: body.fileSizeBytes } : {}),
        ...(body.reportDate ? { reportDate: new Date(body.reportDate) } : {}),
        ...(body.labName !== undefined ? { labName: body.labName } : {}),
        ...(body.doctorName !== undefined ? { doctorName: body.doctorName } : {}),
        ...(body.tags ? { tags: body.tags } : {}),
        ...(body.metadata ? { metadata: body.metadata } : {}),
        ...(body.isAnalyzed !== undefined ? { isAnalyzed: body.isAnalyzed } : {}),
        ...(body.analysisStatus ? { analysisStatus: body.analysisStatus } : {}),
      });

      const updatedReport = await loadReportWithAnalytics(report.dataValues.id, userId);
      res.sendResponse(
        updatedReport ? buildReportResponse(updatedReport) : buildReportResponse(report),
        'Clinical report updated successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'update' });
    }
  },

  delete: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const params = ClinicalReportValidationSchemas.validate<{ id: string }>(
        ClinicalReportValidationSchemas.clinicalReportIdParams,
        req.params as Record<string, unknown>
      );

      const deletedCount = await ClinicalReport.destroy({ where: { id: params.id, userId } });
      if (!deletedCount) {
        throw new NotFoundError('Clinical report not found');
      }

      res.sendResponse({ deleted: true }, 'Clinical report deleted successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'delete' });
    }
  },

  upload: async (_req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      res.sendResponse(
        {
          message: 'Use POST /signed-url/private and then POST /clinical-reports to create a report',
        },
        'Upload flow uses signed URL create flow'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'upload' });
    }
  },
};
