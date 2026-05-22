import { Router } from 'express';
import { authRoutes } from '@routes/auth.routes';
import { onboardingRoutes } from '@routes/onboarding.routes';
import { dashboardRoutes } from '@routes/dashboard.routes';
import { reportsRoutes } from '@routes/reports.routes';
import { clinicalReportsRoutes } from './clinical-reports.routes';
import { healthRoutes } from './health.routes';
import { doctorsRoutes } from './doctors.routes';
import { consentRoutes } from './consent.routes';
import { consentsRoutes } from '@routes/consents.routes';
import { notificationsRoutes } from '@routes/notifications.routes';
import { notificationPreferencesRoutes } from '@routes/notification-preferences.routes';
import { clinicalAnalyticsRoutes } from '@routes/clinical-analytics.routes';
import { visitsRoutes } from '@routes/visits.routes';
import { userRoutes } from '@routes/user.routes';
import { userProfilesRoutes } from '@routes/user-profiles.routes';
import { signedUrlRoutes } from '@routes/signed-url.routes';
import { nudgesRoutes } from '@routes/nudges.routes';
import { consentTextRoutes } from '@routes/consent-text.routes';
// Phase 2 routes
import { prescriptionsRoutes } from '@routes/prescriptions.routes';
import { appointmentsRoutes } from '@routes/appointments.routes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/onboarding', onboardingRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/reports', reportsRoutes);
routes.use('/clinical-reports', clinicalReportsRoutes);
routes.use('/health', healthRoutes);
routes.use('/doctors', doctorsRoutes);
routes.use('/consent-requests', consentsRoutes);
routes.use('/consents', consentsRoutes);
routes.use('/consent', consentRoutes);
routes.use('/consent-text', consentTextRoutes);
routes.use('/notifications', notificationsRoutes);
routes.use('/notification-preferences', notificationPreferencesRoutes);
routes.use('/clinical-analytics', clinicalAnalyticsRoutes);
routes.use('/visits', visitsRoutes);
routes.use('/users', userRoutes);
routes.use('/user', userRoutes);
routes.use('/user-profiles', userProfilesRoutes);
routes.use('/signed-url', signedUrlRoutes);
routes.use('/nudges', nudgesRoutes);
// Phase 2
routes.use('/prescriptions', prescriptionsRoutes);
routes.use('/appointments', appointmentsRoutes);

