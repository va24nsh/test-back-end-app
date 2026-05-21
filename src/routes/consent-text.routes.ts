import { Router } from 'express';
import { consentTextController } from '@controllers/consentText.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const consentTextRoutes = Router();

consentTextRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
consentTextRoutes.get('/active', consentTextController.getActive);
