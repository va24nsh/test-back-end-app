import { Router } from 'express';
import { doctorsController } from '@controllers/doctors.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const doctorsRoutes = Router();

doctorsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
doctorsRoutes.get('/', doctorsController.getAll);
doctorsRoutes.get('/search', doctorsController.search);
