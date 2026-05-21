import { Router } from 'express';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';
import { userProfilesController } from '@controllers/userProfiles.controller';

export const userProfilesRoutes = Router();

userProfilesRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);
userProfilesRoutes.get('/me', userProfilesController.getStatus);
userProfilesRoutes.get('/me/details', userProfilesController.getDetails);
userProfilesRoutes.patch('/me', userProfilesController.updateProfile);
