import { Router } from 'express';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';
import { clinicalReportsController } from '@controllers/clinicalReports.controller';

export const clinicalReportsRoutes = Router();

clinicalReportsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
clinicalReportsRoutes.get('/report-types', clinicalReportsController.getReportTypes);
clinicalReportsRoutes.get('/uploaded-report-types', clinicalReportsController.getReportTypes);
clinicalReportsRoutes.get('/hub-counts', clinicalReportsController.getHubCounts);
clinicalReportsRoutes.get('/', clinicalReportsController.getAll);
clinicalReportsRoutes.get('/:id', clinicalReportsController.getById);
clinicalReportsRoutes.get('/:id/analytics', clinicalReportsController.getAnalytics);
clinicalReportsRoutes.post('/:id/retry-analysis', clinicalReportsController.retryAnalysis);
clinicalReportsRoutes.get('/:id/consent-timeline', clinicalReportsController.getConsentTimeline);
clinicalReportsRoutes.get('/:id/access-list', clinicalReportsController.getAccessList);
clinicalReportsRoutes.post('/:id/revoke-all-access', clinicalReportsController.revokeAllAccess);
clinicalReportsRoutes.post('/', clinicalReportsController.create);
clinicalReportsRoutes.put('/:id', clinicalReportsController.update);
clinicalReportsRoutes.delete('/:id', clinicalReportsController.delete);
