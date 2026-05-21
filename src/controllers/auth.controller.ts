import crypto from 'crypto';
import { Op } from 'sequelize';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { EmailProvider, FirebaseOtpProvider, LoggerFactory, TokenManager } from '@adapters';
import { OtpProvider } from '@adapters/OtpProvider';
import { handleControllerError } from '@utils/errorHandler';
import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  TooManyRequestsError,
    InternalServerError,
  } from '@errors';
import { OtpAttempt, OtpRequest, User, UserAuthToken } from '@models';
import { AuthValidationSchemas } from '@validators';
import adminApp from '@firebase/firebaseAdmin';
import sequelize from '@config/database';
import { config } from '@config/environment';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('AuthController');

// Dev OTP bypass — skips MSG91 calls entirely in development
const DEV_OTP = '123456';
const isDevOtpBypass = config.NODE_ENV === 'development' && process.env.SKIP_OTP === 'true';

class DevOtpProvider implements OtpProvider {
  async sendOtp(input: { phone: string; reqId: string }) {
    logger.info('[DEV] OTP bypass — sendOtp skipped', { phone: '***', reqId: input.reqId });
    return { providerReqId: `dev-${input.reqId}` };
  }
  async resendOtp(input: { phone: string; previousReqId: string; newReqId: string }) {
    logger.info('[DEV] OTP bypass — resendOtp skipped', { newReqId: input.newReqId });
    return { providerReqId: `dev-${input.newReqId}` };
  }
  async verifyOtp(input: { phone: string; otp: string; reqId: string }) {
    if (input.otp !== DEV_OTP) {
      const err = new BadGatewayError('OTP_INVALID');
      (err as any).tag = 'OTP_INVALID';
      throw err;
    }
    logger.info('[DEV] OTP bypass — verifyOtp accepted', { reqId: input.reqId });
  }
}

const otpProvider: OtpProvider = isDevOtpBypass ? new DevOtpProvider() : new FirebaseOtpProvider();
const tokenManager = new TokenManager();
const getEmailProvider = (): EmailProvider => new EmailProvider();

const OTP_REQUEST_EXPIRY_MS = 5 * 60 * 1000;
const OTP_BLOCK_DURATION_MS = 15 * 60 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
const MAX_ACTIVE_SESSIONS = 3;
const SESSION_DURATION_MS = 90 * 24 * 60 * 60 * 1000;
const REFRESH_SLIDING_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type IdentifierType = 'email' | 'phone';

const normalizePhone = (rawPhone: string): string => {
  const cleaned = rawPhone.replace(/\s+/g, '');
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^[1-9]\d{7,14}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  throw new BadRequestError('INVALID_PHONE');
};

const detectIdentifierType = (identifier: string): IdentifierType => {
  if (identifier.includes('@')) {
    return 'email';
  }

  return 'phone';
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return '***';
  }

  const visible = localPart.slice(0, 3);
  return `${visible}${'*'.repeat(Math.max(localPart.length - 3, 1))}@${domain}`;
};

const maskPhone = (phone: string): string => {
  const visible = phone.slice(-4);
  const maskedLength = Math.max(phone.length - 4, 4);
  return `${'*'.repeat(maskedLength)}${visible}`;
};

const buildUserAuthPayload = (user: User) => {
  const verifiedEmail = user.dataValues.email || null;
  const pendingEmail = user.dataValues.emailPending || null;

  return {
    id: user.dataValues.id,
    email: verifiedEmail || pendingEmail,
    firstName: user.dataValues.firstName || null,
    lastName: user.dataValues.lastName || null,
    phoneNumber: user.dataValues.phoneNumber,
    profilePicture: user.dataValues.profilePicture || null,
    address: user.dataValues.address || null,
    city: user.dataValues.city || null,
    state: user.dataValues.state || null,
    country: user.dataValues.country || null,
    postalCode: user.dataValues.postalCode || null,
    gender: user.dataValues.gender || null,
    age: user.dataValues.age ?? null,
    provider: user.dataValues.provider,
    firebaseUserId: user.dataValues.firebaseUserId,
    isActive: user.dataValues.isActive,
    isEmailVerified: Boolean(verifiedEmail),
    isOnboarded: user.dataValues.isOnboarded,
    isProfileCompleted: user.dataValues.isProfileCompleted,
    isTermsAndConditionsAccepted: user.dataValues.isTermsAndConditionsAccepted,
    failedLoginAttempts: user.dataValues.failedLoginAttempts,
    lockedAt: user.dataValues.lockedAt || null,
    lastLoginAt: user.dataValues.lastLoginAt || null,
    createdAt: user.dataValues.createdAt,
    updatedAt: user.dataValues.updatedAt,
  };
};

const appendUniqueProvider = (providers: string[] | null | undefined, provider: string): string[] =>
  Array.from(new Set([...(providers || []), provider]));

const buildActionCodeSettings = (continueUrl: string) => ({
  url: continueUrl,
  handleCodeInApp: true,
});

const generateFirebaseEmailLink = async (email: string, continueUrl: string): Promise<string> => {
  try {
    return await adminApp.auth().generateSignInWithEmailLink(email, buildActionCodeSettings(continueUrl));
  } catch (error) {
    throw new BadGatewayError('EMAIL_LINK_FAILED');
  }
};

const sendMagicLinkEmail = async (email: string, link: string, subject: string): Promise<void> => {
  await getEmailProvider().sendEmail({
    to: email,
    subject,
    htmlContent: `<p>Click <a href="${link}">this link</a> to continue.</p>`,
    textContent: `Continue here: ${link}`,
  });
};

const assertOtpSendCaps = async (phone: string): Promise<void> => {
  const now = new Date();
  const dayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dayCount, weekCount, monthCount] = await Promise.all([
    OtpRequest.count({ where: { phoneNumber: phone, createdAt: { [Op.gte]: dayStart } } }),
    OtpRequest.count({ where: { phoneNumber: phone, createdAt: { [Op.gte]: weekStart } } }),
    OtpRequest.count({ where: { phoneNumber: phone, createdAt: { [Op.gte]: monthStart } } }),
  ]);

  if (dayCount >= 5 || weekCount >= 25 || monthCount >= 50) {
    throw new TooManyRequestsError('OTP_RATE_LIMIT_EXCEEDED');
  }
};

const upsertOtpAttempt = async (phone: string, reset: boolean): Promise<void> => {
  const existing = await OtpAttempt.findOne({ where: { phoneNumber: phone } });
  const now = new Date();

  if (reset) {
    if (existing) {
      await existing.update({
        attemptCount: 0,
        blockedUntil: null,
        lastAttemptAt: now,
      });
    }
    return;
  }

  if (!existing) {
    await OtpAttempt.create({
      phoneNumber: phone,
      attemptCount: 1,
      lastAttemptAt: now,
    });
    return;
  }

  const nextCount = existing.attemptCount + 1;
  await existing.update({
    attemptCount: nextCount,
    lastAttemptAt: now,
    blockedUntil: nextCount >= OTP_MAX_VERIFY_ATTEMPTS ? new Date(now.getTime() + OTP_BLOCK_DURATION_MS) : null,
  });
};

const ensurePhoneUser = async (phoneNumber: string): Promise<{ firebaseUid: string; user: User }> => {
  let firebaseUid: string;

  try {
    const userRecord = await adminApp.auth().getUserByPhoneNumber(phoneNumber);
    firebaseUid = userRecord.uid;
  } catch (error) {
    try {
      const userRecord = await adminApp.auth().createUser({ phoneNumber });
      firebaseUid = userRecord.uid;
    } catch (createError) {
      throw new BadGatewayError('OTP_VERIFY_FAILED');
    }
  }

  let user = await User.findOne({ where: { phoneNumber } });
  if (!user) {
    user = await User.create({
      phoneNumber,
      firebaseUserId: firebaseUid,
      provider: ['phone'],
      isActive: true,
      isVerified: false,
      isOnboarded: false,
      isProfileCompleted: false,
      isAdmin: false,
      failedLoginAttempts: 0,
      emailVerificationActionCount: 0,
      isTermsAndConditionsAccepted: false,
    });
  } else if (user.dataValues.firebaseUserId !== firebaseUid) {
    await user.update({ firebaseUserId: firebaseUid });
  }

  return { firebaseUid, user };
};

const normalizeEmail = (rawEmail: string): string => rawEmail.trim().toLowerCase();

const getCurrentUser = async (userId?: string) => {
  if (!userId) {
    throw new UnauthorizedError('User identity missing');
  }

  const user = await User.findByPk(userId);
  if (!user || !user.dataValues.isActive) {
    throw new ForbiddenError('User is inactive or missing');
  }

  return user;
};

const buildSessionResponse = (accessToken: string, refreshToken: string) => ({
  accessToken,
  refreshToken,
  expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
});

const enforceMaxActiveSessions = async (userId: string): Promise<void> => {
  const activeSessions = await UserAuthToken.findAll({
    where: {
      userId,
      revokedAt: null,
      refreshExpiresAt: { [Op.gt]: new Date() },
    },
    order: [
      ['lastUsedAt', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });

  if (activeSessions.length < MAX_ACTIVE_SESSIONS) {
    return;
  }

  const oldestSession = activeSessions[0];
  if (oldestSession) {
    await oldestSession.update({ revokedAt: new Date() });
  }
};

const createSessionForUser = async (user: User, deviceId: string, ipAddress?: string | null) => {
  await enforceMaxActiveSessions(user.dataValues.id);

  const now = new Date();
  const refreshToken = tokenManager.generateRefreshToken();
  const refreshTokenHash = tokenManager.hashRefreshToken(refreshToken);
  const tokenFamilyId = crypto.randomUUID();
  const sessionExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const refreshExpiresAt = new Date(Math.min(now.getTime() + REFRESH_SLIDING_DURATION_MS, sessionExpiresAt.getTime()));

  const tokenRow = await UserAuthToken.create({
    userId: user.dataValues.id,
    refreshTokenHash,
    deviceId,
    ipAddress: ipAddress || null,
    refreshExpiresAt,
    sessionExpiresAt,
    tokenFamilyId,
    lastUsedAt: now,
  });

  const accessToken = tokenManager.createAccessToken({
    userId: user.dataValues.id,
    firebaseUid: user.dataValues.firebaseUserId,
  });

  return { tokenRow, accessToken, refreshToken };
};

export const authController = {
  lookup: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{
        identifier: string;
        recaptchaToken: string;
      }>(AuthValidationSchemas.lookup, req.body);

      const identifierType = detectIdentifierType(validated.identifier);
      const normalizedIdentifier =
        identifierType === 'email'
          ? normalizeEmail(validated.identifier)
          : normalizePhone(validated.identifier);

      const user =
        identifierType === 'email'
          ? await User.findOne({
              where: {
                [Op.or]: [
                  { email: { [Op.iLike]: normalizedIdentifier } },
                  { emailPending: { [Op.iLike]: normalizedIdentifier } },
                ],
              },
            })
          : await User.findOne({
              where: { phoneNumber: normalizedIdentifier },
            });

      const response = {
        exists: Boolean(user),
        identifierType,
        maskedIdentifier:
          identifierType === 'email'
            ? maskEmail(normalizedIdentifier)
            : maskPhone(normalizedIdentifier),
        linkedMethods: user?.dataValues.provider || [],
        isEmailVerified: Boolean(user?.dataValues.email),
      };

      res.sendResponse(response, 'Identifier lookup completed');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'lookup' });
    }
  },

  emailLoginSendLink: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{
        email: string;
        recaptchaToken: string;
      }>(AuthValidationSchemas.emailLoginSendLink, req.body);

      const normalizedEmail = normalizeEmail(validated.email);
      const user = await User.findOne({
        where: {
          email: { [Op.iLike]: normalizedEmail },
        },
      });

      if (!user || !user.dataValues.email) {
        return res.sendResponse({ sent: true }, 'Login link sent');
      }

      const loginLink = await generateFirebaseEmailLink(normalizedEmail, config.EMAIL_LOGIN_LINK_URL);
      await sendMagicLinkEmail(normalizedEmail, loginLink, 'Sign in to your account');

      res.sendResponse({ sent: true }, 'Login link sent');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'emailLoginSendLink' });
    }
  },

  otpStart: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{
        phone: string;
        recaptchaToken: string;
      }>(AuthValidationSchemas.otpStart, req.body);

      const normalizedPhone = normalizePhone(validated.phone);
      await assertOtpSendCaps(normalizedPhone);

      const otpRequest = await OtpRequest.create({
        phoneNumber: normalizedPhone,
        expiresAt: new Date(Date.now() + OTP_REQUEST_EXPIRY_MS),
        ipAddress: req.ipAddress || null,
      });

      try {
        const { providerReqId } = await otpProvider.sendOtp({
          phone: normalizedPhone,
          reqId: otpRequest.dataValues.id,
        });

        await otpRequest.update({
          provider: 'MSG91',
          providerRequestId: providerReqId,
          status: 'SENT',
        });
      } catch (providerError) {
        await otpRequest.update({ status: 'FAILED' });
        throw providerError;
      }

      const response = {
        success: true,
        reqId: otpRequest && otpRequest.dataValues && otpRequest.dataValues.id && otpRequest?.dataValues?.id,
      };
      res.sendResponse(response, 'OTP sent successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'otpStart' });
    }
  },

  otpResend: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{
        phone: string;
        reqId: string;
        recaptchaToken: string;
      }>(AuthValidationSchemas.otpResend, req.body);

      const normalizedPhone = normalizePhone(validated.phone);
      const previousOtpRequest = await OtpRequest.findByPk(validated.reqId);

      if (!previousOtpRequest || previousOtpRequest.phoneNumber !== normalizedPhone) {
        throw new NotFoundError('REQID_INVALID');
      }

      if (previousOtpRequest.expiresAt <= new Date()) {
        await previousOtpRequest.update({ status: 'EXPIRED' });
        throw new BadRequestError('REQID_EXPIRED');
      }

      await assertOtpSendCaps(normalizedPhone);

      const newOtpRequest = await OtpRequest.create({
        phoneNumber: normalizedPhone,
        expiresAt: new Date(Date.now() + OTP_REQUEST_EXPIRY_MS),
        ipAddress: req.ipAddress || null,
      });

      await otpProvider.resendOtp({
        phone: normalizedPhone,
        previousReqId: previousOtpRequest.id,
        newReqId: newOtpRequest.id,
      });

      const response = {
        success: true,
        reqId: newOtpRequest.id,
      };
      res.sendResponse(response, 'OTP resent successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'otpResend' });
    }
  },


  otpVerify: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{
        phone: string;
        otp: string;
        reqId: string;
        deviceId: string;
        recaptchaToken: string;
      }>(AuthValidationSchemas.otpVerify, req.body);

      if (!validated.reqId || validated.reqId.trim() === '') {
        throw new BadRequestError('REQID_REQUIRED');
      }

      const normalizedPhone = normalizePhone(validated.phone);
      const otpRequestPayload = await OtpRequest.findByPk(validated.reqId);
      const otpRequest = otpRequestPayload?.dataValues;
      if (!otpRequest || otpRequest.phoneNumber !== normalizedPhone) {
        throw new BadRequestError('REQID_REQUIRED');
      }

      if (otpRequest.expiresAt <= new Date()) {
        await otpRequestPayload.update({ status: 'EXPIRED' });
        throw new BadRequestError('REQID_REQUIRED');
      }

      if (otpRequest.status !== 'SENT') {
        throw new BadRequestError('REQID_REQUIRED');
      }

      const otpAttempt = await OtpAttempt.findOne({ where: { phoneNumber: normalizedPhone } });
      if (otpAttempt?.blockedUntil && otpAttempt.blockedUntil > new Date()) {
        throw new TooManyRequestsError('OTP_BLOCKED');
      }

      const providerReqId = otpRequest.providerRequestId;
      if (!providerReqId) {
        throw new InternalServerError('OTP request missing provider correlation ID');
      }

      try {
        await otpProvider.verifyOtp({
          phone: normalizedPhone,
          otp: validated.otp,
          reqId: providerReqId,
        });
      } catch (verifyError) {
        const err = verifyError as any;
        const tag = err?.tag || err?.name;

        if (tag === 'OTP_INVALID') {
          await otpRequestPayload.update({
            attempts: otpRequest.attempts + 1,
            lastAttemptAt: new Date(),
            status: 'FAILED',
          });
          await upsertOtpAttempt(normalizedPhone, false);
          throw new BadRequestError('OTP_INVALID');
        }

        throw verifyError;
      }

      const { user } = await ensurePhoneUser(normalizedPhone);

      await otpRequestPayload.update({
        attempts: otpRequest.attempts + 1,
        lastAttemptAt: new Date(),
        status: 'VERIFIED',
        verifiedAt: new Date(),
        userId: user.dataValues.id,
      });
      await upsertOtpAttempt(normalizedPhone, true);

      // Persist session to DB (enforces max-3-sessions, device binding, token hashing).
      const { accessToken, refreshToken } = await createSessionForUser(
        user,
        validated.deviceId,
        req.ipAddress ?? null,
      );

      const response = {
        accessToken,
        refreshToken,
        user: buildUserAuthPayload(user),
        expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      };
      res.sendResponse(response, 'OTP verified successfully');
    } catch (error) {
      const err = error as any;
      const tag = err?.tag || err?.name;

      if (tag === 'MSG91_VERIFY_FAILED') {
        return res.sendError(new BadGatewayError('OTP_VERIFY_FAILED'));
      }

      handleControllerError(error, res, logger, { method: 'otpVerify' });
    }
  },
  emailVerificationSend: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ email?: string }>(
        AuthValidationSchemas.emailVerificationSend,
        req.body
      );

      const user = await getCurrentUser(req.userId);
      if (user.dataValues.email) {
        throw new ConflictError('EMAIL_ALREADY_VERIFIED');
      }

      const email = validated.email ? normalizeEmail(validated.email) : user.dataValues.emailPending;
      if (!email) {
        throw new BadRequestError('EMAIL_REQUIRED');
      }

      if (user.dataValues.emailVerificationActionCount >= 5) {
        throw new TooManyRequestsError('EMAIL_VERIFICATION_LIMIT_REACHED');
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { emailPending: email }],
        },
      });

      if (existingUser && existingUser.dataValues.id !== user.dataValues.id) {
        throw new ConflictError('EMAIL_IN_USE');
      }

      try {
        await adminApp.auth().getUserByEmail(email);
        throw new ConflictError('EMAIL_IN_USE');
      } catch (error) {
        const firebaseErrorCode = (error as { code?: string } | null)?.code;
        if (!firebaseErrorCode || firebaseErrorCode !== 'auth/user-not-found') {
          throw error;
        }
      }

      const verificationLink = await generateFirebaseEmailLink(email, config.EMAIL_MAGIC_LINK_URL);

      await user.update({
        emailPending: email,
        emailVerificationSentAt: new Date(),
        emailVerificationActionCount: user.dataValues.emailVerificationActionCount + 1,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
        provider: appendUniqueProvider(user.dataValues.provider, 'email'),
      });

      await sendMagicLinkEmail(email, verificationLink, 'Verify your email address');

      res.sendResponse({ sent: true }, 'Verification email sent');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'emailVerificationSend' });
    }
  },

  emailVerificationFinalize: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ email: string; token?: string }>(
        AuthValidationSchemas.emailVerificationFinalize,
        req.body
      );

      const user = await getCurrentUser(req.userId);
      const normalizedEmail = normalizeEmail(validated.email);

      if (user.dataValues.email && user.dataValues.email.toLowerCase() === normalizedEmail) {
        const response = {
          success: true,
          alreadyVerified: true,
          user: buildUserAuthPayload(user),
        };

        return res.sendResponse(response, 'Email already verified');
      }

      if (!user.dataValues.emailPending || user.dataValues.emailPending.toLowerCase() !== normalizedEmail) {
        throw new BadRequestError('EMAIL_MISMATCH');
      }

      await sequelize.transaction(async (transaction) => {
        await user.update(
          {
            email: normalizedEmail,
            emailPending: null,
            emailVerificationSentAt: null,
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
            provider: appendUniqueProvider(user.dataValues.provider, 'email'),
          },
          { transaction }
        );
      });

      await user.reload();
      const response = {
        success: true,
        alreadyVerified: false,
        user: buildUserAuthPayload(user),
      };
      res.sendResponse(response, 'Email verified successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'emailVerificationFinalize' });
    }
  },

  sessionCreate: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ deviceId: string }>(
        AuthValidationSchemas.sessionCreate,
        req.body
      );

      const firebaseUid = req.firebaseUser?.uid;
      if (!firebaseUid) {
        throw new UnauthorizedError('Authorization required');
      }

      const user = await User.findOne({ where: { firebaseUserId: firebaseUid } });
      if (!user) {
        throw new ForbiddenError('SIGNUP_PHONE_ONLY');
      }

      if (!user.dataValues.isOnboarded) {
        throw new ForbiddenError('USER_NOT_ONBOARDED');
      }

      const session = await createSessionForUser(user, validated.deviceId, req.ipAddress || null);
      res.sendResponse(buildSessionResponse(session.accessToken, session.refreshToken), 'Session created successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'sessionCreate' });
    }
  },

  refresh: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ refreshToken: string; deviceId: string }>(
        AuthValidationSchemas.refresh,
        req.body
      );

      const refreshTokenHash = tokenManager.hashRefreshToken(validated.refreshToken);
      const existingToken = await UserAuthToken.findOne({
        where: {
          refreshTokenHash,
          deviceId: validated.deviceId,
        },
      });

      if (!existingToken) {
        throw new UnauthorizedError('REFRESH_TOKEN_INVALID');
      }

      if (existingToken.dataValues.revokedAt) {
        throw new UnauthorizedError('REFRESH_TOKEN_INVALID');
      }

      if (existingToken.dataValues.replacedByTokenId) {
        await UserAuthToken.update(
          { revokedAt: new Date() },
          { where: { userId: existingToken.dataValues.userId, revokedAt: null } }
        );
        throw new UnauthorizedError('REFRESH_TOKEN_REUSE_DETECTED');
      }

      if (existingToken.dataValues.refreshExpiresAt <= new Date() || existingToken.dataValues.sessionExpiresAt <= new Date()) {
        throw new UnauthorizedError('REFRESH_TOKEN_EXPIRED');
      }

      await existingToken.update({ revokedAt: new Date(), lastUsedAt: new Date() });

      const user = await User.findByPk(existingToken.dataValues.userId);
      if (!user) {
        throw new UnauthorizedError('REFRESH_TOKEN_INVALID');
      }

      await enforceMaxActiveSessions(user.dataValues.id);

      const now = new Date();
      const refreshToken = tokenManager.generateRefreshToken();
      const newRefreshTokenHash = tokenManager.hashRefreshToken(refreshToken);
      const refreshExpiresAt = new Date(Math.min(now.getTime() + REFRESH_SLIDING_DURATION_MS, existingToken.dataValues.sessionExpiresAt.getTime()));

      const tokenRow = await UserAuthToken.create({
        userId: user.dataValues.id,
        refreshTokenHash: newRefreshTokenHash,
        deviceId: validated.deviceId,
        ipAddress: req.ipAddress || existingToken.dataValues.ipAddress || null,
        refreshExpiresAt,
        sessionExpiresAt: existingToken.dataValues.sessionExpiresAt,
        tokenFamilyId: existingToken.dataValues.tokenFamilyId || crypto.randomUUID(),
        lastUsedAt: now,
      });

      await existingToken.update({ replacedByTokenId: tokenRow.id });

      const accessToken = tokenManager.createAccessToken({
        userId: user.dataValues.id,
        firebaseUid: user.dataValues.firebaseUserId,
      });

      res.sendResponse(buildSessionResponse(accessToken, refreshToken), 'Session refreshed successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'refresh' });
    }
  },

  logout: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ deviceId: string }>(
        AuthValidationSchemas.logout,
        req.body
      );

      const user = await getCurrentUser(req.userId);
      await UserAuthToken.update(
        { revokedAt: new Date() },
        {
          where: {
            userId: user.dataValues.id,
            deviceId: validated.deviceId,
            revokedAt: null,
          },
        }
      );

      res.sendResponse({ success: true }, 'Logged out successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'logout' });
    }
  },

  exchange: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = AuthValidationSchemas.validate<{ deviceId?: string }>(
        AuthValidationSchemas.exchange,
        req.body
      );

      const firebaseUid = req.firebaseUser?.uid;
      if (!firebaseUid) {
        throw new ForbiddenError('SIGNUP_PHONE_ONLY');
      }

      const user = await User.findOne({ where: { firebaseUserId: firebaseUid } });
      if (!user) {
        // Signup is phone-only — email/Google cannot create a new user record
        throw new ForbiddenError('SIGNUP_PHONE_ONLY');
      }

      // Sync provider list from Firebase
      const firebaseUser = await adminApp.auth().getUser(firebaseUid);

      const mappedProviders = new Set<string>();
      firebaseUser.providerData.forEach((providerData) => {
        if (providerData.providerId === 'phone') mappedProviders.add('phone');
        if (providerData.providerId === 'password') mappedProviders.add('email');
        if (providerData.providerId === 'google.com') mappedProviders.add('google');
      });

      if (firebaseUser.phoneNumber) mappedProviders.add('phone');
      if (user.dataValues.email || user.dataValues.emailPending) mappedProviders.add('email');

      // Only allow Google if the verified email matches the Firebase email
      const userEmail = user.dataValues.email ? user.dataValues.email.toLowerCase() : null;
      const firebaseEmail = firebaseUser.email ? firebaseUser.email.toLowerCase() : null;
      const canPersistGoogle = Boolean(userEmail && firebaseEmail && userEmail === firebaseEmail);

      if (!canPersistGoogle && mappedProviders.has('google')) {
        mappedProviders.delete('google');
        try {
          await adminApp.auth().updateUser(firebaseUid, { providersToUnlink: ['google.com'] });
        } catch {
          logger.warn('Failed to unlink google provider during exchange', { method: 'exchange' });
        }
      }

      const nextProviders = Array.from(mappedProviders);
      const providerChanged =
        JSON.stringify(nextProviders.sort()) !==
        JSON.stringify((user.dataValues.provider || []).slice().sort());

      if (providerChanged) {
        await user.update({ provider: nextProviders });
        await user.reload();
      }

      // If not onboarded, return user profile so the client can route to onboarding
      if (!user.dataValues.isOnboarded) {
        return res.sendResponse(
          { onboarded: false, user: buildUserAuthPayload(user) },
          'Exchange completed — onboarding required'
        );
      }

      // Onboarded: issue backend tokens
      // deviceId is optional here (email/Google login paths may not send it)
      const deviceId = validated.deviceId ?? `exchange-${firebaseUid}`;
      const session = await createSessionForUser(user, deviceId, req.ipAddress ?? null);

      return res.sendResponse(
        {
          onboarded: true,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
          user: buildUserAuthPayload(user),
        },
        'Exchange completed successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'exchange' });
    }
  },
};
