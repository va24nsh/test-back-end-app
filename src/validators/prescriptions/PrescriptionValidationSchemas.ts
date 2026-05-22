import Joi from 'joi';
import { ValidationError } from '@errors';

const listQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'completed', 'cancelled').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const getByIdParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

const pdfParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

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

export const PrescriptionValidationSchemas = {
  listQuery: listQuerySchema,
  getByIdParams: getByIdParamsSchema,
  pdfParams: pdfParamsSchema,
  validate,
};
