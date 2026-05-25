import Joi from 'joi';
import { ValidationError } from '@errors';

const e164PhonePattern = /^\+[1-9]\d{7,14}$/;

const lookupSchema = Joi.object({
  identifier: Joi.string().required().trim().min(3).max(255),
  recaptchaToken: Joi.string().required().trim().min(10).max(4096),
});

const otpStartSchema = Joi.object({
  phone: Joi.string().required().trim().pattern(e164PhonePattern),
  recaptchaToken: Joi.string().required().trim().min(10).max(4096),
});

const otpResendSchema = Joi.object({
  phone: Joi.string().required().trim().pattern(e164PhonePattern),
  reqId: Joi.string().required().trim().uuid(),
  recaptchaToken: Joi.string().required().trim().min(10).max(4096),
});

const otpVerifySchema = Joi.object({
  phone: Joi.string().required().trim().pattern(e164PhonePattern),
  otp: Joi.string().required().trim().pattern(/^\d{4,8}$/),
  reqId: Joi.string().required().trim().uuid(),
  deviceId: Joi.string().required().trim().min(1).max(255),
  recaptchaToken: Joi.string().required().trim().min(10).max(4096),
});

const emailLoginSendLinkSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  recaptchaToken: Joi.string().required().trim().min(10).max(4096),
}).unknown(false);

const emailVerifyLinkSchema = Joi.object({
  oobCode: Joi.string().required().trim().min(1).max(4096),
  email: Joi.string().email().required().trim().lowercase(),
  deviceId: Joi.string().required().trim().min(1).max(255),
  recaptchaToken: Joi.string().trim().min(10).max(4096).optional(),
}).unknown(false);

const exchangeSchema = Joi.object({
  deviceId: Joi.string().trim().min(1).max(255).optional(),
}).unknown(false);

const emailVerificationSendSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().optional(),
}).min(0).unknown(false);

const emailVerificationFinalizeSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  token: Joi.string().trim().min(16).optional(),
}).unknown(false);

const sessionCreateSchema = Joi.object({
  deviceId: Joi.string().required().trim().min(1).max(255),
}).unknown(false);

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().trim().min(32),
  deviceId: Joi.string().required().trim().min(1).max(255),
}).unknown(true);

const logoutSchema = Joi.object({
  deviceId: Joi.string().required().trim().min(1).max(255),
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

export const AuthValidationSchemas = {
  lookup: lookupSchema,
  otpStart: otpStartSchema,
  otpResend: otpResendSchema,
  otpVerify: otpVerifySchema,
  emailLoginSendLink: emailLoginSendLinkSchema,
  emailVerifyLink: emailVerifyLinkSchema,
  exchange: exchangeSchema,
  emailVerificationSend: emailVerificationSendSchema,
  emailVerificationFinalize: emailVerificationFinalizeSchema,
  sessionCreate: sessionCreateSchema,
  refresh: refreshSchema,
  logout: logoutSchema,
  validate,
};
