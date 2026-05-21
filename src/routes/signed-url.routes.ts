import { Router } from 'express';
import { signedUrlsController } from '@controllers/signedUrls.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken, verifyFirebaseIdToken } from '@middlewares';

export const signedUrlRoutes = Router();

signedUrlRoutes.post('/public', rateLimitMiddleware, verifyFirebaseIdToken, signedUrlsController.publicUpload);
signedUrlRoutes.post('/private', rateLimitMiddleware, verifyAccessToken, fetchUser, signedUrlsController.privateSignedUrl);