import { Router } from 'express';
import { userController } from '@controllers/user.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const userRoutes = Router();

userRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);

// User profile endpoints
userRoutes.get('/me', userController.getProfile);
userRoutes.patch('/me', userController.updateProfile);
userRoutes.get('/', userController.getProfile);
userRoutes.put('/', userController.updateProfile);
userRoutes.get('/sections', userController.getSections);
userRoutes.get('/sections/:sectionId', userController.getSection);
userRoutes.put('/sections/:sectionId', userController.updateSection);
userRoutes.get('/completion-status', userController.getCompletionStatus);
