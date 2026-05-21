import { Router } from 'express';
import { dashboardController } from '@controllers/dashboard.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const dashboardRoutes = Router();

dashboardRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);

dashboardRoutes.get('/home', dashboardController.getDashboard);
dashboardRoutes.get('/', dashboardController.getDashboard);
dashboardRoutes.get('/stats', dashboardController.getStats);
dashboardRoutes.get('/recent-activity', dashboardController.getRecentActivity);

