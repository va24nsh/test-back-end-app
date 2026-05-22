import Joi from 'joi';
import { ValidationError } from '@errors';

const VALID_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const dateNotBeforeToday = (value: string, helpers: Joi.CustomHelpers) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(value + 'T00:00:00');
  if (inputDate < today) {
    return helpers.error('date.notBeforeToday');
  }
  return value;
};

const createBodySchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom(dateNotBeforeToday)
    .messages({
      'string.pattern.base': '"date" must be in YYYY-MM-DD format',
      'date.notBeforeToday': '"date" must not be before today',
    }),
  timeSlot: Joi.string()
    .valid(...VALID_TIME_SLOTS)
    .required()
    .messages({
      'any.only': '"timeSlot" must be a valid 30-minute interval between 09:00 and 17:30',
    }),
  patientName: Joi.string().trim().min(1).max(200).required(),
  patientPhone: Joi.string().trim().min(1).max(20).required(),
  patientGender: Joi.string().valid('Male', 'Female', 'Other').required(),
  patientAge: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .custom((value, helpers) => {
      const age = parseInt(value, 10);
      if (age < 1 || age > 150) {
        return helpers.error('patientAge.range');
      }
      return value;
    })
    .messages({
      'string.pattern.base': '"patientAge" must be a string representing a positive integer',
      'patientAge.range': '"patientAge" must represent an integer between 1 and 150',
    }),
}).unknown(false);

const listQuerySchema = Joi.object({
  status: Joi.string().valid('UPCOMING', 'COMPLETED', 'CANCELLED').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const cancelParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(false);

const slotsQuerySchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom(dateNotBeforeToday)
    .messages({
      'string.pattern.base': '"date" must be in YYYY-MM-DD format',
      'date.notBeforeToday': '"date" must not be before today',
    }),
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

export const AppointmentValidationSchemas = {
  createBody: createBodySchema,
  listQuery: listQuerySchema,
  cancelParams: cancelParamsSchema,
  slotsQuery: slotsQuerySchema,
  validate,
};
