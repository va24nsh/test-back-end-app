import { ClinicalReport, ConsentItem, ConsentRequest, ConsentTextVersion, Doctor } from '@models';

export const PROFILE_SECTION_LABELS: Record<string, string> = {
  basic_details: 'Basic details',
  medical_history: 'Medical history',
  family_history: 'Family history',
  medications: 'Medications',
  allergies: 'Allergies',
  genetic: 'Genetic',
  environmental: 'Environmental',
  reproductive: 'Reproductive',
  lifestyle: 'Lifestyle',
};

export const buildDoctorResponse = (doctor: Doctor) => ({
  id: doctor.dataValues.id,
  externalDoctorId: doctor.dataValues.externalDoctorId || null,
  firstName: doctor.dataValues.firstName,
  lastName: doctor.dataValues.lastName,
  specialization: doctor.dataValues.specialization || null,
  hospitalName: doctor.dataValues.hospitalName || null,
  profilePicture: doctor.dataValues.profilePicture || null,
  status: doctor.dataValues.status,
  isVerified: doctor.dataValues.isVerified,
  fees: doctor.dataValues.fees ?? null,
  yearsExperience: doctor.dataValues.yearsExperience ?? null,
  qualification: doctor.dataValues.qualification ?? null,
});

export const buildReportSummary = (report: ClinicalReport) => ({
  id: report.dataValues.id,
  reportType: report.dataValues.reportType,
  reportDate: report.dataValues.reportDate,
  description: report.dataValues.description || null,
});

export const buildConsentRequestResponse = (request: ConsentRequest, doctor?: Doctor | null) => ({
  id: request.dataValues.id,
  doctorId: request.dataValues.doctorId,
  externalDoctorId: request.dataValues.externalDoctorId || null,
  userId: request.dataValues.userId,
  source: request.dataValues.source,
  requestedAccessType: request.dataValues.requestedAccessType,
  requestType: request.dataValues.requestType,
  requestScope: request.dataValues.requestScope || null,
  requestMessage: request.dataValues.requestMessage || null,
  status: request.dataValues.status,
  grantedScope: request.dataValues.grantedScope || null,
  careProcessingConsent: request.dataValues.careProcessingConsent,
  trainingConsent: request.dataValues.trainingConsent,
  consentTextVersionId: request.dataValues.consentTextVersionId || null,
  consentTextVersion: request.dataValues.consentTextVersion || null,
  consentTextCare: request.dataValues.consentTextCare || null,
  consentTextTraining: request.dataValues.consentTextTraining || null,
  userConsentTimestamp: request.dataValues.userConsentTimestamp || null,
  expiresAt: request.dataValues.expiresAt || null,
  revokedAt: request.dataValues.revokedAt || null,
  createdAt: request.dataValues.createdAt,
  updatedAt: request.dataValues.updatedAt,
  doctor: doctor ? buildDoctorResponse(doctor) : null,
});

export const getActiveConsentTextSnapshot = async () => {
  const activeVersion = await ConsentTextVersion.findOne({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
  return activeVersion
    ? {
        consentTextVersionId: activeVersion.id,
        consentTextVersion: activeVersion.version,
        consentTextCare: activeVersion.consentTextCare,
        consentTextTraining: activeVersion.consentTextTraining,
      }
    : {
        consentTextVersionId: null,
        consentTextVersion: null,
        consentTextCare: null,
        consentTextTraining: null,
      };
};

export const buildConsentItemResponse = (item: ConsentItem, report?: ClinicalReport | null) => ({
  id: item.dataValues.id,
  consentRequestId: item.dataValues.consentRequestId,
  doctorId: item.dataValues.doctorId,
  externalDoctorId: item.dataValues.externalDoctorId || null,
  userId: item.dataValues.userId,
  itemType: item.dataValues.itemType,
  itemId: item.dataValues.itemId,
  status: item.dataValues.status,
  approvedAt: item.dataValues.approvedAt || null,
  revokedAt: item.dataValues.revokedAt || null,
  reportSummary: report ? buildReportSummary(report) : null,
  profileSection: item.dataValues.itemType === 'PROFILE_SECTION' ? { key: item.dataValues.itemId, label: PROFILE_SECTION_LABELS[item.dataValues.itemId] || item.dataValues.itemId } : null,
});

export const parseJsonScope = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};
