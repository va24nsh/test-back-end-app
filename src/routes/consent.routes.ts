import { Router } from 'express';
import { consentsController } from '@controllers/consents.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const consentRoutes = Router();

consentRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
consentRoutes.get('/doctors', consentsController.getDoctors);
consentRoutes.get('/timeline', consentsController.getTimeline);
consentRoutes.get('/items', consentsController.getConsentItems);
consentRoutes.delete('/items/:id/revoke', consentsController.revokeConsentItem);
consentRoutes.post('/doctors/:doctorId/revoke-reports', consentsController.revokeDoctorReports);
consentRoutes.post('/doctors/:doctorId/revoke-profile-sections', consentsController.revokeDoctorProfileSections);
consentRoutes.post('/doctors/:doctorId/revoke-all', consentsController.revokeDoctorAll);
