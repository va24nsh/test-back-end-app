import { LoggerFactory } from '@adapters';
import { NotFoundError, ValidationError } from '@errors';
import { Notification } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { NotificationValidationSchemas } from '@validators';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('NotificationsController');

const buildNotificationResponse = (notification: Notification) => ({
  id: notification.dataValues.id,
  title: notification.dataValues.title,
  body: notification.dataValues.body,
  type: notification.dataValues.type,
  priority: notification.dataValues.priority,
  isRead: notification.dataValues.isRead,
  createdAt: notification.dataValues.createdAt,
  actionUrl: notification.dataValues.actionUrl || null,
});

export const notificationsController = {
  getUnreadCount: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const unreadCount = await Notification.count({
        where: { userId, isRead: false },
      });

      res.sendResponse({ unreadCount }, 'Unread notification count retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getUnreadCount' });
    }
  },

  getAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const query = NotificationValidationSchemas.validate<{
        page: number;
        limit: number;
      }>(NotificationValidationSchemas.notificationListQuery, req.query as Record<string, unknown>);

      const offset = (query.page - 1) * query.limit;
      const rows = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: query.limit + 1,
        offset,
      });

      const hasNextPage = rows.length > query.limit;
      const items = rows.slice(0, query.limit).map(buildNotificationResponse);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage,
          nextPage: hasNextPage ? query.page + 1 : null,
        },
        'Notifications retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAll' });
    }
  },

  markAsRead: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const params = NotificationValidationSchemas.validate<{ id: string }>(
        NotificationValidationSchemas.markNotificationReadParams,
        req.params as Record<string, unknown>
      );
      NotificationValidationSchemas.validate<{ isRead: boolean }>(
        NotificationValidationSchemas.markNotificationReadBody,
        req.body
      );

      const notification = await Notification.findOne({
        where: { id: params.id, userId },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      await notification.update({
        isRead: true,
        readAt: notification.dataValues.readAt || new Date(),
      });

      res.sendResponse(
        {
          id: notification.dataValues.id,
          isRead: notification.dataValues.isRead,
          readAt: notification.dataValues.readAt,
        },
        'Notification marked as read successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'markAsRead' });
    }
  },
};

