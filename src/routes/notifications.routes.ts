import { Router } from 'express';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';
import { notificationsController } from '@controllers/notifications.controller';

export const notificationsRoutes = Router();

notificationsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
notificationsRoutes.get('/unread-count', notificationsController.getUnreadCount);
notificationsRoutes.get('/', notificationsController.getAll);
notificationsRoutes.patch('/:id/read', notificationsController.markAsRead);

