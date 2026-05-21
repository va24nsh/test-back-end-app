import { Router } from 'express';
import { healthController } from '@controllers/health.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const healthRoutes = Router();

healthRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
healthRoutes.get('/summary', healthController.getSummary);
healthRoutes.get('/abnormal-items', healthController.getAbnormalItems);
