import crypto from 'crypto';
import { Op, Transaction } from 'sequelize';
import { EmailProvider, LoggerFactory } from '@adapters';
import { BadRequestError, ConflictError, NotFoundError, TooManyRequestsError } from '@errors';
import { User, UserProfile } from '@models';
import sequelize from '@config/database';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { handleControllerError } from '@utils/errorHandler';
import { UserProfileValidationSchemas } from '@validators';
import adminApp from '@firebase/firebaseAdmin';
import { config } from '@config/environment';

const logger = new LoggerFactory().createLogger('UserProfilesController');
const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

const getEmailProvider = (): EmailProvider => new EmailProvider();

const normalizeEmail = (rawEmail: string): string => rawEmail.trim().toLowerCase();

const buildVerificationLink = (email: string, token: string): string => {
  const baseUrl = config.APP_PUBLIC_URL;
  const url = new URL('/auth/email/verification/finalize', baseUrl);
  url.searchParams.set('email', email);
  url.searchParams.set('token', token);
  return url.toString();
};

const buildUserResponse = (user: User) => ({
  id: user.dataValues.id,
  email: user.dataValues.email || user.dataValues.emailPending || null,
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
  isEmailVerified: Boolean(user.dataValues.email),
  isOnboarded: user.dataValues.isOnboarded,
  isProfileCompleted: user.dataValues.isProfileCompleted,
  isTermsAndConditionsAccepted: user.dataValues.isTermsAndConditionsAccepted,
  failedLoginAttempts: user.dataValues.failedLoginAttempts,
  lockedAt: user.dataValues.lockedAt || null,
  lastLoginAt: user.dataValues.lastLoginAt || null,
  createdAt: user.dataValues.createdAt,
  updatedAt: user.dataValues.updatedAt,
});

const getUserByFirebaseUid = async (firebaseUid?: string) => {
  if (!firebaseUid) {
    throw new BadRequestError('Firebase user identity is required');
  }

  const user = await User.findOne({ where: { firebaseUserId: firebaseUid } });
  if (!user || !user.dataValues.isActive) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const getOrCreateUserProfile = async (userId: string, transaction?: Transaction) => {
  const [profile] = await UserProfile.findOrCreate({
    where: { userId },
    defaults: { userId, stepsCompleted: {}, profileCompletionPercentage: 0 },
    transaction,
  });

  return profile;
};

const toProfileDetails = (profile: UserProfile) => ({
  dateOfBirth: profile.dateOfBirth || null,
  bloodType: profile.bloodType || null,
  heightCm: profile.heightCm ?? null,
  weightKg: profile.weightKg ?? null,
  emergencyContactName: profile.emergencyContactName || null,
  emergencyContactRelationship: profile.emergencyContactRelationship || null,
  emergencyContactPhone: profile.emergencyContactPhone || null,
  emergencyContactEmail: profile.emergencyContactEmail || null,
  medicalHistory: profile.medicalHistory ?? null,
  familyHistory: profile.familyHistory ?? null,
  currentMedications: profile.currentMedications ?? null,
  allergies: profile.allergies ?? null,
  geneticTesting: profile.geneticTesting ?? null,
  environmentalFactors: profile.environmentalFactors ?? null,
  reproductiveHistory: profile.reproductiveHistory ?? null,
  lifestyle: profile.lifestyle ?? null,
});

const SECTION_DEFINITIONS = [
  { key: 'basic_details', fields: ['dateOfBirth', 'bloodType', 'heightCm', 'weightKg'] },
  { key: 'emergency', fields: ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone', 'emergencyContactEmail'] },
  { key: 'medical_history', fields: ['medicalHistory', 'familyHistory'] },
  { key: 'current_health', fields: ['currentMedications', 'allergies'] },
  { key: 'advanced', fields: ['geneticTesting', 'environmentalFactors', 'reproductiveHistory'] },
  { key: 'lifestyle', fields: ['lifestyle'] },
] as const;

const computeStepsCompleted = (profile: UserProfile, patchBody?: Record<string, unknown>) => {
  const currentSteps = (profile.stepsCompleted || {}) as Record<string, boolean>;
  const nextSteps: Record<string, boolean> = { ...currentSteps };
  const currentValues = profile.toJSON() as unknown as Record<string, unknown>;

  for (const section of SECTION_DEFINITIONS) {
    const touched = patchBody ? section.fields.some((field) => Object.prototype.hasOwnProperty.call(patchBody, field)) : true;
    const populated = section.fields.some((field) => {
      const value = currentValues[field];
      return value !== null && value !== undefined && value !== '';
    });

    nextSteps[section.key] = touched ? populated : Boolean(nextSteps[section.key]);
  }

  const completedCount = SECTION_DEFINITIONS.filter((section) => nextSteps[section.key]).length;
  const profileCompletionPercentage = Math.round((completedCount / SECTION_DEFINITIONS.length) * 100);

  return { nextSteps, profileCompletionPercentage };
};

const ensureUniqueEmail = async (email: string, userId: string) => {
  const existingUser = await User.findOne({
    where: { [Op.or]: [{ email: { [Op.iLike]: email } }, { emailPending: { [Op.iLike]: email } }] },
  });

  if (existingUser && existingUser.dataValues.id !== userId) {
    throw new ConflictError('EMAIL_IN_USE');
  }

  try {
    await adminApp.auth().getUserByEmail(email);
    throw new ConflictError('EMAIL_IN_USE');
  } catch (error) {
    const firebaseErrorCode = (error as { code?: string } | null)?.code;
    if (firebaseErrorCode && firebaseErrorCode !== 'auth/user-not-found') {
      throw error;
    }
  }
};

const applyOnboardingPatch = async (user: User, payload: Record<string, unknown>) => {
  const nextUpdates: Record<string, unknown> = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    address: payload.address ?? user.dataValues.address,
    city: payload.city ?? user.dataValues.city,
    state: payload.state ?? user.dataValues.state,
    country: payload.country ?? user.dataValues.country,
    postalCode: payload.postalCode ?? user.dataValues.postalCode,
    gender: payload.gender ?? user.dataValues.gender,
    age: payload.age ?? user.dataValues.age,
    profilePicture: payload.profilePicture ?? user.dataValues.profilePicture,
    isOnboarded: true,
  };

  if (Object.prototype.hasOwnProperty.call(payload, 'email') && payload.email !== null && payload.email !== undefined) {
    const email = normalizeEmail(String(payload.email));
    if (user.dataValues.emailVerificationActionCount >= 5) {
      throw new TooManyRequestsError('EMAIL_VERIFICATION_LIMIT_REACHED');
    }

    await ensureUniqueEmail(email, user.dataValues.id);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    nextUpdates.emailPending = email;
    nextUpdates.email = null;
    nextUpdates.emailVerificationTokenHash = verificationTokenHash;
    nextUpdates.emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS);
    nextUpdates.emailVerificationSentAt = new Date();
    nextUpdates.emailVerificationActionCount = user.dataValues.emailVerificationActionCount + 1;
    nextUpdates.provider = Array.from(new Set([...(user.dataValues.provider || []), 'email']));

    await getEmailProvider().sendVerificationEmail(email, buildVerificationLink(email, verificationToken));

    return { nextUpdates, verificationEmailSent: true };
  }

  return { nextUpdates, verificationEmailSent: false };
};

export const userProfilesController = {
  getStatus: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      const profile = await getOrCreateUserProfile(userId);

      res.sendResponse({ stepsCompleted: profile.stepsCompleted || {}, profileCompletionPercentage: profile.profileCompletionPercentage || 0 }, 'Profile status retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getStatus' });
    }
  },

  getDetails: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      const profile = await getOrCreateUserProfile(userId);

      res.sendResponse(toProfileDetails(profile), 'Profile details retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getDetails' });
    }
  },

  updateProfile: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      const validated = UserProfileValidationSchemas.validate<Record<string, unknown>>(
        UserProfileValidationSchemas.profilePatch,
        req.body
      );

      const profile = await getOrCreateUserProfile(userId);
      await profile.update(validated);
      const { nextSteps, profileCompletionPercentage } = computeStepsCompleted(profile, validated);

      await profile.update({ stepsCompleted: nextSteps, profileCompletionPercentage });
      await User.update({ isProfileCompleted: profileCompletionPercentage === 100 }, { where: { id: userId } });
      await profile.reload();

      res.sendResponse({ stepsCompleted: profile.stepsCompleted, profileCompletionPercentage: profile.profileCompletionPercentage }, 'Profile updated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'updateProfile' });
    }
  },

  completeOnboarding: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = UserProfileValidationSchemas.validate<Record<string, unknown>>(
        UserProfileValidationSchemas.onboardingComplete,
        req.body
      );

      let user: User;
      if (req.firebaseUser?.uid) {
        user = await getUserByFirebaseUid(req.firebaseUser.uid);
      } else if (req.userId) {
        const found = await User.findByPk(req.userId);
        if (!found || !found.dataValues.isActive) throw new NotFoundError('User not found');
        user = found;
      } else {
        throw new BadRequestError('User identity is required');
      }
      let verificationEmailSent = false;

      await sequelize.transaction(async (transaction) => {
        const onboardingResult = await applyOnboardingPatch(user, validated);
        verificationEmailSent = onboardingResult.verificationEmailSent;

        await user.update(onboardingResult.nextUpdates, { transaction });
        const userId = user.dataValues.id;
        const profile = await getOrCreateUserProfile(userId, transaction);
        const { nextSteps, profileCompletionPercentage } = computeStepsCompleted(profile);

        await profile.update({ stepsCompleted: nextSteps, profileCompletionPercentage }, { transaction });
        await User.update({ isProfileCompleted: profileCompletionPercentage === 100 }, { where: { id: userId }, transaction });
      });

      await user.reload();

      res.sendResponse(
        {
          verificationEmailSent,
          user: buildUserResponse(user),
        },
        'Onboarding completed successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'completeOnboarding' });
    }
  },
};
