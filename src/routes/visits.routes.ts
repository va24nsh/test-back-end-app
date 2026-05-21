import { Router } from 'express';
import { visitsController } from '@controllers/visits.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const visitsRoutes = Router();

visitsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
visitsRoutes.get('/', visitsController.getAll);
visitsRoutes.get('/:id', visitsController.getById);
visitsRoutes.post('/', visitsController.create);
visitsRoutes.put('/:id', visitsController.update);
visitsRoutes.delete('/:id', visitsController.delete);
visitsRoutes.post('/log', visitsController.logVisit);

