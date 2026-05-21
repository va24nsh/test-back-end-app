import { ExtendedRequest, ExtendedResponse } from '@types';
import { handleControllerError } from '@utils/errorHandler';
import { LoggerFactory } from '@adapters';
import { userProfilesController } from '@controllers/userProfiles.controller';

const logger = new LoggerFactory().createLogger('OnboardingController');

export const onboardingController = {
  start: async (_req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      res.sendResponse({ started: true }, 'Onboarding started successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'start' });
    }
  },

  getStatus: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        res.sendResponse({ isOnboarded: false }, 'Onboarding status retrieved successfully');
        return;
      }

      const isOnboarded = Boolean(req.user?.isOnboarded);
      res.sendResponse({ isOnboarded }, 'Onboarding status retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getStatus' });
    }
  },

  complete: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      await userProfilesController.completeOnboarding(req, res);
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'complete' });
    }
  },
};

