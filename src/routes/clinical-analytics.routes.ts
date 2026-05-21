import { Router } from 'express';
import { clinicalAnalyticsController } from '@controllers/clinical-analytics.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const clinicalAnalyticsRoutes = Router();

clinicalAnalyticsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
clinicalAnalyticsRoutes.get('/overview', clinicalAnalyticsController.getOverview);
clinicalAnalyticsRoutes.get('/trends', clinicalAnalyticsController.getTrends);
clinicalAnalyticsRoutes.get('/insights', clinicalAnalyticsController.getInsights);

