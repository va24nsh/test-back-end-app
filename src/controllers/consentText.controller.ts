import { LoggerFactory } from '@adapters';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { getActiveConsentTextSnapshot } from '@utils/consent-utils';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('ConsentTextController');

export const consentTextController = {
  getActive: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const snapshot = await getActiveConsentTextSnapshot();
      res.sendResponse(snapshot, 'Active consent text retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getActive' });
    }
  },
};
