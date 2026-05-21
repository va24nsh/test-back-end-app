import { Router } from 'express';
import { clinicalReportsController } from '@controllers/clinicalReports.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const reportsRoutes = Router();

reportsRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
reportsRoutes.get('/report-types', clinicalReportsController.getReportTypes);
reportsRoutes.get('/uploaded-report-types', clinicalReportsController.getReportTypes);
reportsRoutes.get('/hub-counts', clinicalReportsController.getHubCounts);
reportsRoutes.get('/', clinicalReportsController.getAll);
reportsRoutes.get('/:id', clinicalReportsController.getById);
reportsRoutes.post('/', clinicalReportsController.create);
reportsRoutes.put('/:id', clinicalReportsController.update);
reportsRoutes.delete('/:id', clinicalReportsController.delete);

