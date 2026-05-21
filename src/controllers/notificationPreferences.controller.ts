import { LoggerFactory } from '@adapters';
import { ForbiddenError, NotFoundError, ValidationError } from '@errors';
import { NotificationEvent, NotificationPreference, User } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { NotificationValidationSchemas } from '@validators';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('NotificationPreferencesController');

const buildPreferenceResponse = (preference: NotificationPreference, eventCode: string) => ({
  id: preference.dataValues.id,
  eventCode,
  viaEmail: preference.dataValues.viaEmail,
  viaInApp: preference.dataValues.viaInApp,
  isEnabled: preference.dataValues.isEnabled,
});

const ensureDefaultPreferences = async (userId: string): Promise<void> => {
  const activeEvents = await NotificationEvent.findAll({
    where: { isActive: true },
    order: [['createdAt', 'ASC']],
  });

  if (activeEvents.length === 0) {
    return;
  }

  const existingPreferences = await NotificationPreference.findAll({
    where: { userId },
    attributes: ['notificationEventId'],
  });

  const existingEventIds = new Set(existingPreferences.map((preference) => preference.dataValues.notificationEventId));
  const missingPreferences = activeEvents
    .filter((event) => !existingEventIds.has(event.dataValues.id))
    .map((event) => ({
      userId,
      notificationEventId: event.dataValues.id,
      viaEmail: true,
      viaSms: false,
      viaInApp: true,
      isEnabled: true,
      isEditable: true,
      isPublic: true,
    }));

  if (missingPreferences.length > 0) {
    await NotificationPreference.bulkCreate(missingPreferences);
  }
};

export const notificationPreferencesController = {
  getAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      await ensureDefaultPreferences(userId);

      const preferences = await NotificationPreference.findAll({
        where: { userId, isPublic: true },
        include: [
          {
            model: NotificationEvent,
            as: 'event',
            attributes: ['eventCode'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      const items = preferences.map((preference) => {
        const event = preference.get('event') as NotificationEvent | null;
        return buildPreferenceResponse(preference, event?.dataValues.eventCode || '');
      });

      res.sendResponse({ items }, 'Notification preferences retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAll' });
    }
  },

  updateById: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const params = NotificationValidationSchemas.validate<{ id: string }>(
        NotificationValidationSchemas.notificationPreferenceIdParams,
        req.params as Record<string, unknown>
      );
      const body = NotificationValidationSchemas.validate<{
        viaEmail?: boolean;
        viaInApp?: boolean;
      }>(NotificationValidationSchemas.notificationPreferenceUpdateBody, req.body);

      const preference = await NotificationPreference.findOne({
        where: { id: params.id, userId },
      });

      if (!preference) {
        throw new NotFoundError('Notification preference not found');
      }

      if (!preference.dataValues.isEditable) {
        throw new ForbiddenError('Notification preference is not editable');
      }

      await preference.update({
        viaEmail: body.viaEmail ?? preference.dataValues.viaEmail,
        viaInApp: body.viaInApp ?? preference.dataValues.viaInApp,
      });

      const event = await NotificationEvent.findByPk(preference.dataValues.notificationEventId, {
        attributes: ['eventCode'],
      });

      res.sendResponse(
        buildPreferenceResponse(preference, event?.dataValues.eventCode || ''),
        'Notification preference updated successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'updateById' });
    }
  },
};
