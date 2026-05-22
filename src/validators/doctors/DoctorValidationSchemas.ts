import Joi from 'joi';
import { ValidationError } from '@errors';

const doctorSearchQuerySchema = Joi.object({
  query: Joi.string().trim().min(1).max(200).required(),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const doctorListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  specialization: Joi.string().trim().max(200).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE'),
}).unknown(false);

const doctorCreateBodySchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  specialization: Joi.string().trim().max(200).optional().allow(null),
  hospitalName: Joi.string().trim().max(500).optional().allow(null),
  profilePicture: Joi.string().trim().max(2000).optional().allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE'),
  isVerified: Joi.boolean().default(true),
  fees: Joi.number().integer().min(0).max(999999).optional().allow(null),
  yearsExperience: Joi.number().integer().min(0).max(100).optional().allow(null),
  qualification: Joi.string().trim().max(500).optional().allow(null),
}).unknown(false);

const doctorUpdateBodySchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).optional(),
  lastName: Joi.string().trim().min(1).max(100).optional(),
  specialization: Joi.string().trim().max(200).optional().allow(null),
  hospitalName: Joi.string().trim().max(500).optional().allow(null),
  profilePicture: Joi.string().trim().max(2000).optional().allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
  isVerified: Joi.boolean().optional(),
  fees: Joi.number().integer().min(0).max(999999).optional().allow(null),
  yearsExperience: Joi.number().integer().min(0).max(100).optional().allow(null),
  qualification: Joi.string().trim().max(500).optional().allow(null),
}).unknown(false);

const doctorIdParamsSchema = Joi.object({
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

export const DoctorValidationSchemas = {
  doctorSearchQuery: doctorSearchQuerySchema,
  doctorListQuery: doctorListQuerySchema,
  doctorCreateBody: doctorCreateBodySchema,
  doctorUpdateBody: doctorUpdateBodySchema,
  doctorIdParams: doctorIdParamsSchema,
  validate,
};
