import crypto from 'crypto';
import { EmailProvider, LoggerFactory } from '@adapters';
import { ExtendedRequest, ExtendedResponse, UserUpdateDTO } from '@types';
import { User, UserProfile } from '@models';
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from '@errors';
import { UserValidationSchemas } from '@validators';
import { handleControllerError } from '@utils/errorHandler';
import adminApp from '@firebase/firebaseAdmin';
import { config } from '@config/environment';

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

const profileSectionKeys = [
  'basic_details',
  'emergency',
  'medical_history',
  'current_health',
  'advanced',
  'lifestyle',
] as const;

const getOrCreateUserProfile = async (userId: string) => {
  const [profile] = await UserProfile.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      stepsCompleted: {},
      profileCompletionPercentage: 0,
    },
  });

  return profile;
};

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('UserController');

export const userController = {
  /**
   * Get user profile
   * Merged usecase logic: Directly query User model and return profile data
   */
  getProfile: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await User.findByPk(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.sendResponse(buildUserResponse(user), 'Profile retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getProfile' });
    }
  },

  /**
   * Update user profile
   * Merged usecase logic: Validate input, update User model directly
   */
  updateProfile: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      // Validate input using Joi schema
      const validatedData = UserValidationSchemas.validate<UserUpdateDTO>(
        UserValidationSchemas.updateUser,
        req.body
      );
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      if (validatedData.email && user.dataValues.email) {
        throw new ConflictError('EMAIL_ALREADY_VERIFIED');
      }

      if (validatedData.email && !user.dataValues.email) {
        const normalizedEmail = normalizeEmail(validatedData.email);

        const existingUser = await User.findOne({
          where: { email: normalizedEmail },
        });
        if (existingUser && existingUser.dataValues.id !== user.dataValues.id) {
          throw new ConflictError('EMAIL_IN_USE');
        }

        const existingPendingUser = await User.findOne({
          where: { emailPending: normalizedEmail },
        });
        if (existingPendingUser && existingPendingUser.dataValues.id !== user.dataValues.id) {
          throw new ConflictError('EMAIL_IN_USE');
        }

        try {
          await adminApp.auth().getUserByEmail(normalizedEmail);
          // throw new ConflictError('EMAIL_IN_USE');
        } catch (error) {
          const firebaseErrorCode = (error as { code?: string } | null)?.code;
          if (firebaseErrorCode && firebaseErrorCode !== 'auth/user-not-found') {
            throw error;
          }
        }

        if (user.dataValues.emailVerificationActionCount >= 5) {
          throw new TooManyRequestsError('EMAIL_VERIFICATION_LIMIT_REACHED');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

        await user.update({
          emailPending: normalizedEmail,
          email: null,
          emailVerificationTokenHash: verificationTokenHash,
          emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
          emailVerificationSentAt: new Date(),
          emailVerificationActionCount: user.dataValues.emailVerificationActionCount + 1,
          provider: Array.from(new Set([...(user.dataValues.provider || []), 'email'])),
        });

        await getEmailProvider().sendVerificationEmail(
          normalizedEmail,
          buildVerificationLink(normalizedEmail, verificationToken)
        );
      }

      await user.update({
        firstName: validatedData.firstName ?? user.dataValues.firstName,
        lastName: validatedData.lastName ?? user.dataValues.lastName,
        phoneNumber: validatedData.phoneNumber ?? user.dataValues.phoneNumber,
        profilePicture: validatedData.profilePicture ?? user.dataValues.profilePicture,
        address: validatedData.address ?? user.dataValues.address,
        city: validatedData.city ?? user.dataValues.city,
        state: validatedData.state ?? user.dataValues.state,
        country: validatedData.country ?? user.dataValues.country,
        gender: validatedData.gender ?? user.dataValues.gender,
        age: validatedData.age ?? user.dataValues.age,
      });

      await user.reload();

      res.sendResponse(buildUserResponse(user), 'Profile updated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'updateProfile' });
    }
  },

  getSections: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      // TODO: Implement get all sections logic
      // Direct DB queries here, no separate usecase
      res.sendResponse({ sections: [] }, 'Sections retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getSections' });
    }
  },

  getSection: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      // TODO: Implement get section by id logic
      // Direct DB queries here, no separate usecase
      res.sendResponse({ section: null }, 'Section retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getSection' });
    }
  },

  updateSection: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      // TODO: Implement update section logic
      // Direct DB queries here, no separate usecase
      res.sendResponse({ section: null }, 'Section updated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'updateSection' });
    }
  },

  getCompletionStatus: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'isOnboarded'],
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const profile = await getOrCreateUserProfile(userId);
      const stepsCompleted = (profile.stepsCompleted || {}) as Record<string, boolean>;
      const completedFields = profileSectionKeys.filter((key) => Boolean(stepsCompleted[key]));
      const completionPercentage = profile.profileCompletionPercentage || Math.round((completedFields.length / profileSectionKeys.length) * 100);

      const response = {
        isOnboarded: user.dataValues.isOnboarded,
        completionPercentage,
        completedFields: completedFields.length,
        totalFields: profileSectionKeys.length,
        missingFields: profileSectionKeys.filter((field) => !completedFields.includes(field)),
      };
      res.sendResponse(response, 'Completion status retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getCompletionStatus' });
    }
  },
};

