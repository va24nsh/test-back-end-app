import { Router } from 'express';
import { prescriptionsController } from '@controllers/prescriptions.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const prescriptionsRoutes = Router();

prescriptionsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
prescriptionsRoutes.get('/', prescriptionsController.list);
prescriptionsRoutes.get('/:id', prescriptionsController.getById);
prescriptionsRoutes.get('/:id/pdf', prescriptionsController.getPdf);
