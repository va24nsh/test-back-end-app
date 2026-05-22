import { Router } from 'express';
import { appointmentsController } from '@controllers/appointments.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const appointmentsRoutes = Router();

appointmentsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
appointmentsRoutes.post('/', appointmentsController.create);
appointmentsRoutes.get('/', appointmentsController.list);
appointmentsRoutes.patch('/:id/cancel', appointmentsController.cancel);
appointmentsRoutes.get('/slots', appointmentsController.getSlots);
