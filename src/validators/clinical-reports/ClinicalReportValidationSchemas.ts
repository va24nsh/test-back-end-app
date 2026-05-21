import Joi from 'joi';
import { ValidationError } from '@errors';

const clinicalReportListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  reportType: Joi.string().optional().trim().max(500),
}).unknown(false);

const clinicalReportIdParamsSchema = Joi.object({
  id: Joi.string().required().uuid(),
}).unknown(false);

const clinicalReportCreateBodySchema = Joi.object({
  reportType: Joi.string().required().trim().min(1).max(100),
  description: Joi.string().optional().allow('', null).trim().max(5000),
  fileUrl: Joi.string().required().trim().uri({ scheme: ['http', 'https', 'gs'] }).max(2000),
  fileMimeType: Joi.string().optional().trim().max(100),
  fileSizeBytes: Joi.number().optional().integer().min(0),
  reportDate: Joi.string().optional().isoDate(),
  labName: Joi.string().optional().allow('', null).trim().max(500),
  doctorName: Joi.string().optional().allow('', null).trim().max(200),
}).unknown(false);

const clinicalReportUpdateBodySchema = Joi.object({
  reportType: Joi.string().optional().trim().min(1).max(100),
  description: Joi.string().optional().allow('', null).trim().max(5000),
  fileUrl: Joi.string().optional().trim().uri({ scheme: ['http', 'https', 'gs'] }).max(2000),
  fileMimeType: Joi.string().optional().allow('', null).trim().max(100),
  fileSizeBytes: Joi.number().optional().integer().min(0),
  reportDate: Joi.string().optional().isoDate(),
  labName: Joi.string().optional().allow('', null).trim().max(500),
  doctorName: Joi.string().optional().allow('', null).trim().max(200),
  tags: Joi.object().optional(),
  metadata: Joi.object().optional(),
  isAnalyzed: Joi.boolean().optional(),
  analysisStatus: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').optional(),
}).min(1).unknown(false);

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

export const ClinicalReportValidationSchemas = {
  clinicalReportListQuery: clinicalReportListQuerySchema,
  clinicalReportIdParams: clinicalReportIdParamsSchema,
  clinicalReportCreateBody: clinicalReportCreateBodySchema,
  clinicalReportUpdateBody: clinicalReportUpdateBodySchema,
  validate,
};
