import { Router } from 'express';
import { onboardingController } from '@controllers/onboarding.controller';
import { rateLimitMiddleware, verifyFirebaseOrAccessToken } from '@middlewares';

export const onboardingRoutes = Router();

onboardingRoutes.use(rateLimitMiddleware, verifyFirebaseOrAccessToken);
onboardingRoutes.post('/start', onboardingController.start);
onboardingRoutes.get('/status', onboardingController.getStatus);
onboardingRoutes.post('/complete', onboardingController.complete);

