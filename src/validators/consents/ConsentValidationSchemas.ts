import Joi from 'joi';
import { ValidationError } from '@errors';

const consentRequestQuerySchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED').required(),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const consentRequestIdParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

const consentRequestItemsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const consentRespondBodySchema = Joi.object({
  action: Joi.string().valid('APPROVE', 'REJECT').required(),
  approvedRequestType: Joi.string().valid('FULL_REPORT', 'DATE_RANGE', 'SPECIFIC', 'FULL_PROFILE', 'SPECIFIC_SECTIONS').when('action', {
    is: 'APPROVE',
    then: Joi.required(),
  }),
  approvedScope: Joi.object().unknown(true).when('action', {
    is: 'APPROVE',
    then: Joi.required(),
  }),
  careProcessingConsent: Joi.boolean().required(),
  trainingConsent: Joi.boolean().required(),
}).unknown(false);

const consentDoctoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const consentItemsQuerySchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const consentItemIdParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

const revokeDoctorParamsSchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
}).unknown(false);

const createConsentRequestBodySchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  requestedAccessType: Joi.string().valid('REPORTS', 'PROFILE', 'BOTH').required(),
  requestType: Joi.string().valid('FULL_REPORT', 'DATE_RANGE', 'SPECIFIC', 'FULL_PROFILE', 'SPECIFIC_SECTIONS').required(),
  requestScope: Joi.object().unknown(true).required(),
  requestMessage: Joi.string().allow(null, '').optional(),
  careProcessingConsent: Joi.boolean().required().valid(true),
  trainingConsent: Joi.boolean().required(),
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

export const ConsentValidationSchemas = {
  consentRequestQuery: consentRequestQuerySchema,
  consentRequestIdParams: consentRequestIdParamsSchema,
  consentRequestItemsQuery: consentRequestItemsQuerySchema,
  consentRespondBody: consentRespondBodySchema,
  consentDoctorsQuery: consentDoctoryQuerySchema,
  consentItemsQuery: consentItemsQuerySchema,
  consentItemIdParams: consentItemIdParamsSchema,
  revokeDoctorParams: revokeDoctorParamsSchema,
  createConsentRequestBody: createConsentRequestBodySchema,
  validate,
};
