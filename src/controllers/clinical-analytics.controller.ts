import { LoggerFactory } from '@adapters';
import { ValidationError } from '@errors';
import { ClinicalReport, ClinicalReportAnalytics, User } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { buildHealthSummaryData, sortBySeverityAndDate, ReportWithAnalytics } from '@utils/clinical-report-insights';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('ClinicalAnalyticsController');

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
    throw new ValidationError('User not found');
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

export const clinicalAnalyticsController = {
  getOverview: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const reports = await loadUserReports(getUserId(req));
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
        },
        'Clinical analytics overview retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getOverview' });
    }
  },

  getTrends: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const reports = await loadUserReports(getUserId(req));
      const healthData = buildHealthSummaryData(reports);

      res.sendResponse(
        {
          trends: healthData.insights.map((insight) => ({
            id: insight.id,
            metricName: insight.metricName,
            reportType: insight.reportType,
            reportDate: insight.reportDate,
            severity: insight.severity,
            trend: insight.trend,
          })),
        },
        'Clinical trends retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getTrends' });
    }
  },

  getInsights: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const reports = await loadUserReports(getUserId(req));
      const healthData = buildHealthSummaryData(reports);

      res.sendResponse(
        {
          insights: sortBySeverityAndDate(healthData.insights),
          abnormalItems: healthData.abnormalItems,
        },
        'Clinical insights retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getInsights' });
    }
  },
};

