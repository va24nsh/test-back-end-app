import { Router } from 'express';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';
import { notificationPreferencesController } from '@controllers/notificationPreferences.controller';

export const notificationPreferencesRoutes = Router();

notificationPreferencesRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
notificationPreferencesRoutes.get('/', notificationPreferencesController.getAll);
notificationPreferencesRoutes.patch('/:id', notificationPreferencesController.updateById);
