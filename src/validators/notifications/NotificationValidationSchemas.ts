import Joi from 'joi';
import { ValidationError } from '@errors';

const notificationListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const markNotificationReadParamsSchema = Joi.object({
  id: Joi.string().required().uuid(),
}).unknown(false);

const markNotificationReadBodySchema = Joi.object({
  isRead: Joi.boolean().required().valid(true),
}).unknown(false);

const notificationPreferenceIdParamsSchema = Joi.object({
  id: Joi.string().required().uuid(),
}).unknown(false);

const notificationPreferenceUpdateBodySchema = Joi.object({
  viaEmail: Joi.boolean().optional(),
  viaInApp: Joi.boolean().optional(),
})
  .or('viaEmail', 'viaInApp')
  .unknown(false);

const validate = <T>(schema: Joi.Schema, data: Record<string, unknown> | undefined): T => {
  const body = data ?? {};
  const { error, value } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const fieldErrors: Record<string, string[]> = {};
    error.details.forEach((detail) => {
      const path = detail.path.join('.') || 'body';
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(detail.message);
    });

    throw new ValidationError('Validation failed', fieldErrors);
  }

  return value as T;
};

export const NotificationValidationSchemas = {
  notificationListQuery: notificationListQuerySchema,
  markNotificationReadParams: markNotificationReadParamsSchema,
  markNotificationReadBody: markNotificationReadBodySchema,
  notificationPreferenceIdParams: notificationPreferenceIdParamsSchema,
  notificationPreferenceUpdateBody: notificationPreferenceUpdateBodySchema,
  validate,
};
