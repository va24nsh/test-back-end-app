import Joi from 'joi';
import { ValidationError } from '@errors';

const onboardingCompleteSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  address: Joi.string().trim().max(500).allow(null).optional(),
  city: Joi.string().trim().max(100).allow(null).optional(),
  state: Joi.string().trim().max(100).allow(null).optional(),
  country: Joi.string().trim().max(100).allow(null).optional(),
  postalCode: Joi.string().trim().max(20).allow(null).optional(),
  gender: Joi.string().trim().valid('male', 'female', 'other', 'non-binary', 'prefer-not-to-say').allow(null).optional(),
  age: Joi.number().integer().min(0).max(150).allow(null).optional(),
  email: Joi.string().email().trim().lowercase().allow(null).optional(),
  profilePicture: Joi.string().uri().max(2000).allow(null).optional(),
}).min(1).unknown(false);

const profilePatchSchema = Joi.object({
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  bloodType: Joi.string().trim().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown').allow(null).optional(),
  heightCm: Joi.number().precision(2).min(0).allow(null).optional(),
  weightKg: Joi.number().precision(2).min(0).allow(null).optional(),
  emergencyContactName: Joi.string().trim().max(200).allow(null).optional(),
  emergencyContactRelationship: Joi.string().trim().max(100).allow(null).optional(),
  emergencyContactPhone: Joi.string().trim().max(20).allow(null).optional(),
  emergencyContactEmail: Joi.string().email().trim().lowercase().allow(null).optional(),
  medicalHistory: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  familyHistory: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  currentMedications: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  allergies: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  geneticTesting: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  environmentalFactors: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  reproductiveHistory: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
  lifestyle: Joi.alternatives().try(Joi.array().items(Joi.object().unknown(true)), Joi.object().unknown(true)).allow(null).optional(),
}).min(1).unknown(false);

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

export const UserProfileValidationSchemas = {
  onboardingComplete: onboardingCompleteSchema,
  profilePatch: profilePatchSchema,
  validate,
};
