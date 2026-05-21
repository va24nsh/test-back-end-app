/**
 * User Validation Schemas
 * 
 * This module contains validation schemas for user-related operations using Joi.
 */

import Joi from 'joi';
import { ValidationError } from '@errors';

// Create user schema
export const createUserSchema = Joi.object({
  firstName: Joi.string().required().trim().min(1).max(100),
  lastName: Joi.string().required().trim().min(1).max(100),
  phoneNumber: Joi.string().optional().trim().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,9}$/),
  provider: Joi.string().valid('GOOGLE', 'NATIVE').default('GOOGLE'),
  isTermsAndConditionsAccepted: Joi.boolean().required().valid(true),
});

// Update user schema
export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional().trim().min(1).max(100),
  lastName: Joi.string().optional().trim().min(1).max(100),
  email: Joi.string().optional().email().trim().lowercase(),
  phoneNumber: Joi.string().optional().trim().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,9}$/),
  profilePicture: Joi.string().optional().uri().max(2000),
  address: Joi.string().optional().trim().max(500),
  city: Joi.string().optional().trim().max(100),
  state: Joi.string().optional().trim().max(100),
  country: Joi.string().optional().trim().max(100),
  gender: Joi.string().optional().valid('male', 'female', 'other'),
  age: Joi.number().optional().integer().min(0).max(150),
});

// User query schema
export const userQuerySchema = Joi.object({
  search: Joi.string().optional().trim().max(200),
  isActive: Joi.boolean().optional(),
  isEmailVerified: Joi.boolean().optional(),
  isOnboarded: Joi.boolean().optional(),
  limit: Joi.number().optional().integer().min(1).max(100).default(20),
  offset: Joi.number().optional().integer().min(0).default(0),
});

// User ID schema
export const userIdSchema = Joi.string().required().uuid();

// User verify OTP schema
export const verifyOTPSchema = Joi.object({
  otp: Joi.string().required().length(6).pattern(/^[0-9A-Za-z]{6}$/),
});

// Validation helper function
export const validateWithJoi = <T>(schema: Joi.Schema, data: Record<string, unknown> | undefined): T => {
  if (!data) {
    throw new ValidationError('Request body is required');
  }
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const fieldErrors: Record<string, string[]> = {};
    error.details.forEach((detail) => {
      const path = detail.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(detail.message);
    });
    throw new ValidationError('Validation failed', fieldErrors);
  }

  return value as T;
};

// Export all schemas
export const UserValidationSchemas = {
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  userQuery: userQuerySchema,
  userId: userIdSchema,
  verifyOTP: verifyOTPSchema,
  validate: validateWithJoi,
};
