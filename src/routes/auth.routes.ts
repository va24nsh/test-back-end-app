import { Router, type RequestHandler } from 'express';
import { authController } from '@controllers/auth.controller';
import {
	authRateLimitMiddleware,
	fetchUser,
	rateLimitMiddleware,
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
authRoutes.post('/exchange', rateLimitMiddleware, verifyFirebaseIdToken, asHandler(authController.exchange));
authRoutes.post('/email/add', rateLimitMiddleware, verifyFirebaseIdToken, fetchUser, asHandler(authController.emailVerificationSend));
authRoutes.post('/email/verification/send', rateLimitMiddleware, verifyFirebaseIdToken, fetchUser, asHandler(authController.emailVerificationSend));
authRoutes.post('/email/finalize', rateLimitMiddleware, verifyFirebaseIdToken, fetchUser, asHandler(authController.emailVerificationFinalize));
authRoutes.post('/email/verification/finalize', rateLimitMiddleware, verifyFirebaseIdToken, fetchUser, asHandler(authController.emailVerificationFinalize));
authRoutes.post('/session/create', rateLimitMiddleware, verifyFirebaseIdToken, asHandler(authController.sessionCreate));
authRoutes.post('/refresh', authRateLimitMiddleware, verifyRecaptchaV3, asHandler(authController.refresh));
authRoutes.post('/logout', rateLimitMiddleware, verifyFirebaseIdToken, fetchUser, asHandler(authController.logout));
