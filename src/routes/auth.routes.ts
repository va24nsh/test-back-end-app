import { Router, type RequestHandler } from 'express';
import { authController } from '@controllers/auth.controller';
import {
	authRateLimitMiddleware,
	fetchUser,
	rateLimitMiddleware,
	verifyAccessToken,
	verifyFirebaseIdToken,
	verifyRecaptchaV3,
} from '@middlewares';

export const authRoutes = Router();

const asHandler = (handler: unknown): RequestHandler => {
	return handler as RequestHandler;
};

authRoutes.post('/lookup', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.lookup));
authRoutes.post('/otp/start', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.otpStart));
authRoutes.post('/otp/resend', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.otpResend));
authRoutes.post('/otp/verify', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.otpVerify));
authRoutes.post('/email/login/send-link', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.emailLoginSendLink));
authRoutes.post('/email/verify-link', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.emailVerifyLink));
authRoutes.post('/exchange', rateLimitMiddleware, verifyFirebaseIdToken, asHandler(authController.exchange));
authRoutes.post('/email/add', rateLimitMiddleware, verifyAccessToken, fetchUser, asHandler(authController.emailVerificationSend));
authRoutes.post('/email/verification/send', rateLimitMiddleware, verifyAccessToken, fetchUser, asHandler(authController.emailVerificationSend));
authRoutes.post('/email/finalize', rateLimitMiddleware, verifyAccessToken, fetchUser, asHandler(authController.emailVerificationFinalize));
authRoutes.post('/email/verification/finalize', rateLimitMiddleware, verifyAccessToken, fetchUser, asHandler(authController.emailVerificationFinalize));
authRoutes.post('/session/create', rateLimitMiddleware, verifyFirebaseIdToken, asHandler(authController.sessionCreate));
authRoutes.post('/refresh', authRateLimitMiddleware, asHandler(authController.refresh));
authRoutes.post('/logout', rateLimitMiddleware, verifyAccessToken, fetchUser, asHandler(authController.logout));
