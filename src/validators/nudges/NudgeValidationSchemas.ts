import Joi from 'joi';
import { ValidationError } from '@errors';

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).unknown(false);

const markReadParams = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

const markReadBody = Joi.object({
  isRead: Joi.boolean().valid(true).required(),
}).unknown(false);

const validate = <T>(schema: Joi.Schema, data: Record<string, unknown> | undefined): T => {
  const body = data ?? {};
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });

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

export const NudgeValidationSchemas = {
  listQuery: listQuerySchema,
  markReadParams,
  markReadBody,
  validate,
};
