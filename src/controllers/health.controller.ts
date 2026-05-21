import { LoggerFactory } from '@adapters';
import { NotFoundError, ValidationError } from '@errors';
import { ClinicalReport, ClinicalReportAnalytics, User } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { HealthValidationSchemas } from '@validators';
import { buildHealthSummaryData, sortBySeverityAndDate, ReportWithAnalytics } from '@utils/clinical-report-insights';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('HealthController');

const getUserId = (req: ExtendedRequest): string => {
  const userId = req.userId || req.user?.id;
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  return userId;
};

const loadUserReports = async (userId: string): Promise<ReportWithAnalytics[]> => {
  const user = await User.findByPk(userId);
  if (!user || !user.dataValues.isActive) {
    throw new NotFoundError('User not found');
  }

  return ClinicalReport.findAll({
    where: { userId },
    include: [{ model: ClinicalReportAnalytics, as: 'analytics' }],
    order: [
      ['uploadedDate', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  }) as Promise<ReportWithAnalytics[]>;
};

export const healthController = {
  getSummary: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const reports = await loadUserReports(userId);
      const healthData = buildHealthSummaryData(reports);

      res.sendResponse(
        {
          statusCard: {
            overallStatus: healthData.overallStatus,
            uploadedReportsCount: healthData.uploadedReportsCount,
            analyzedReportsCount: healthData.analyzedReportsCount,
            analyzedReportTypesCount: healthData.analyzedReportTypesCount,
            lastAnalyzedAt: healthData.lastAnalyzedAt,
            topInsights: healthData.topInsights,
          },
          insights: healthData.insights,
          abnormalItems: healthData.abnormalItems,
        },
        'Health summary retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getSummary' });
    }
  },

  getAbnormalItems: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);
      const query = HealthValidationSchemas.validate<{ page: number; limit: number }>(
        HealthValidationSchemas.abnormalItemsQuery,
        req.query as Record<string, unknown>
      );

      const reports = await loadUserReports(userId);
      const healthData = buildHealthSummaryData(reports);
      const offset = (query.page - 1) * query.limit;
      const items = sortBySeverityAndDate(healthData.abnormalItems).slice(offset, offset + query.limit);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage: offset + query.limit < healthData.abnormalItems.length,
          nextPage: offset + query.limit < healthData.abnormalItems.length ? query.page + 1 : null,
        },
        'Abnormal items retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAbnormalItems' });
    }
  },
};
