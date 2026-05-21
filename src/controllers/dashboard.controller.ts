import { Op } from 'sequelize';
import { LoggerFactory } from '@adapters';
import { ValidationError } from '@errors';
import { ClinicalReport, ClinicalReportAnalytics, Notification, User } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('DashboardController');

const getUserId = (req: ExtendedRequest): string => {
  const userId = req.userId || req.user?.id;
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  return userId;
};

const severityRank: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const buildAbnormalItem = (report: ClinicalReport & { analytics?: ClinicalReportAnalytics | null }) => {
  const abnormalValues = report.analytics?.abnormalValues;
  if (!abnormalValues || typeof abnormalValues !== 'object') {
    return [];
  }

  const entries = Array.isArray(abnormalValues)
    ? abnormalValues
    : Object.entries(abnormalValues).map(([metricName, value]) => ({ metricName, ...(value as Record<string, unknown>) }));

  return entries.map((entry) => ({
    name: String((entry as Record<string, unknown>).metricName || (entry as Record<string, unknown>).name || 'Unknown'),
    reportId: report.dataValues.id,
    reportType: report.dataValues.reportType,
    currentValue:
      (entry as Record<string, unknown>).currentValue ||
      ((entry as Record<string, unknown>).current && typeof (entry as Record<string, unknown>).current === 'object'
        ? `${String(((entry as Record<string, unknown>).current as Record<string, unknown>).value ?? '')}${
            ((entry as Record<string, unknown>).current as Record<string, unknown>).unit ? ` ${String(((entry as Record<string, unknown>).current as Record<string, unknown>).unit)}` : ''
          }`.trim()
        : null),
    expectedRange:
      (entry as Record<string, unknown>).expectedRange ||
      (entry as Record<string, unknown>).referenceRange ||
      null,
    previousValue: (entry as Record<string, unknown>).previousValue || null,
    riskLevel: (entry as Record<string, unknown>).riskLevel || report.analytics?.riskLevel || null,
    reportDate: report.dataValues.reportDate,
    analysisDate: report.analytics?.analysisDate || null,
  }));
};

export const dashboardController = {
  getDashboard: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);

      const [user, reports, unreadCount, activeNotifications] = await Promise.all([
        User.findByPk(userId),
        ClinicalReport.findAll({
          where: { userId },
          include: [{ model: ClinicalReportAnalytics, as: 'analytics' }],
          order: [
            ['uploadedDate', 'DESC'],
            ['createdAt', 'DESC'],
          ],
        }),
        Notification.count({ where: { userId, isRead: false } }),
        Notification.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 3,
        }),
      ]);

      const abnormalItems = reports
        .flatMap((report) => buildAbnormalItem(report))
        .sort((left, right) => {
          const leftRank = severityRank[String(left.riskLevel || '')] ?? 99;
          const rightRank = severityRank[String(right.riskLevel || '')] ?? 99;
          if (leftRank !== rightRank) {
            return leftRank - rightRank;
          }

          return new Date(right.analysisDate || right.reportDate).getTime() - new Date(left.analysisDate || left.reportDate).getTime();
        })
        .slice(0, 2)
        .map((item) => ({
          name: item.name,
          reportId: item.reportId,
          reportType: item.reportType,
          currentValue: item.currentValue,
          expectedRange: item.expectedRange,
          previousValue: item.previousValue,
        }));

      const recentReportSummaries = reports.map((report) => {
        const analytics = (report as ClinicalReport & { analytics?: ClinicalReportAnalytics | null }).analytics ?? null;

        return {
          id: report.dataValues.id,
          reportType: report.dataValues.reportType,
          reportDate: report.dataValues.reportDate,
          analysisStatus: report.dataValues.analysisStatus || null,
          riskLevel: analytics?.riskLevel || null,
        };
      });

      res.sendResponse(
        {
          user: user
            ? {
                id: user.dataValues.id,
                firstName: user.dataValues.firstName || null,
                lastName: user.dataValues.lastName || null,
                profilePicture: user.dataValues.profilePicture || null,
                email: user.dataValues.email || user.dataValues.emailPending || null,
                isEmailVerified: Boolean(user.dataValues.email),
              }
            : null,
          unreadNotificationCount: unreadCount,
          abnormalItems,
          recentUploads: recentReportSummaries.slice(0, 3),
          recentNotifications: activeNotifications.map((notification) => ({
            id: notification.dataValues.id,
            title: notification.dataValues.title,
            body: notification.dataValues.body,
            isRead: notification.dataValues.isRead,
            createdAt: notification.dataValues.createdAt,
            actionUrl: notification.dataValues.actionUrl || null,
          })),
        },
        'Dashboard summary retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getDashboard' });
    }
  },

  getStats: async (req: ExtendedRequest, res: ExtendedResponse) => {
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
        'Dashboard stats retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getStats' });
    }
  },

  getRecentActivity: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = getUserId(req);

      const [reports, notifications] = await Promise.all([
        ClinicalReport.findAll({
          where: { userId },
          include: [{ model: ClinicalReportAnalytics, as: 'analytics' }],
          order: [
            ['uploadedDate', 'DESC'],
            ['createdAt', 'DESC'],
          ],
          limit: 5,
        }),
        Notification.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 5,
        }),
      ]);

      const recentReports = reports.map((report) => {
        const analytics = (report as ClinicalReport & { analytics?: ClinicalReportAnalytics | null }).analytics ?? null;

        return {
          type: 'REPORT',
          id: report.dataValues.id,
          title: report.dataValues.description || report.dataValues.reportType,
          createdAt: report.dataValues.createdAt,
          analysisStatus: report.dataValues.analysisStatus || null,
          riskLevel: analytics?.riskLevel || null,
        };
      });

      res.sendResponse(
        {
          items: [
            ...recentReports,
            ...notifications.map((notification) => ({
              type: 'NOTIFICATION',
              id: notification.dataValues.id,
              title: notification.dataValues.title,
              createdAt: notification.dataValues.createdAt,
              isRead: notification.dataValues.isRead,
            })),
          ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
        },
        'Recent activity retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getRecentActivity' });
    }
  },
};

