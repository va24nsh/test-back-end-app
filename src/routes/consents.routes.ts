import { Router } from 'express';
import { consentsController } from '@controllers/consents.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const consentsRoutes = Router();

consentsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
consentsRoutes.post('/', consentsController.create);
consentsRoutes.get('/', consentsController.getAll);
consentsRoutes.get('/:id', consentsController.getById);
consentsRoutes.get('/:id/items', consentsController.getRequestItems);
consentsRoutes.put('/:id/respond', consentsController.respond);
consentsRoutes.delete('/:id/revoke', consentsController.revoke);

