import Joi from 'joi';
import { ValidationError } from '@errors';

const fileNamePattern = /^[a-zA-Z0-9._ -]{1,255}$/;

const publicUploadSchema = Joi.object({
  fileName: Joi.string().required().trim().pattern(fileNamePattern),
  contentType: Joi.string().required().trim().valid('image/png', 'image/jpeg', 'image/webp'),
  featureName: Joi.string().required().trim().valid('user'),
  featureId: Joi.string().required().trim().min(1).max(255),
  event: Joi.string().required().trim().valid('profile'),
}).unknown(false);

const privateUploadSchema = Joi.object({
  fileName: Joi.string().required().trim().pattern(fileNamePattern),
  contentType: Joi.string().required().trim().valid('image/png', 'image/jpeg', 'image/webp', 'application/pdf'),
  featureName: Joi.string().required().trim().valid('user', 'clinical_report'),
  featureId: Joi.string().required().trim().min(1).max(255),
  event: Joi.string().required().trim().valid('profile', 'upload'),
}).unknown(false);

const privateDownloadSchema = Joi.object({
  fileUrl: Joi.string().required().trim().min(10).max(2000),
}).unknown(false);

const privateSignedUrlSchema = Joi.alternatives().try(privateUploadSchema, privateDownloadSchema).required();

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

export const SignedUrlValidationSchemas = {
  publicUpload: publicUploadSchema,
  privateSignedUrl: privateSignedUrlSchema,
  validate,
};