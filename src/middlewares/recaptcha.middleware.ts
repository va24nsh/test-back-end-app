import { NextFunction } from 'express';
import { BadRequestError, ForbiddenError } from '@errors';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { config } from '@config/environment';

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
}

const verifyRecaptchaToken = async (token: string): Promise<boolean> => {
  const secret = config.RECAPTCHA_SECRET_KEY || "";

  if (!secret || config.NODE_ENV !== 'production') {
    return config.NODE_ENV !== 'production';
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret,
      response: token,
    }).toString(),
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as RecaptchaVerifyResponse;
  const threshold = config.RECAPTCHA_SCORE_THRESHOLD;

  if (!result.success) {
    return false;
  }

  if (typeof result.score === 'number' && result.score < threshold) {
    return false;
  }

  return true;
};

export const verifyRecaptchaV3 = async (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
): Promise<void> => {
  try {
    const recaptchaToken = String(req.body?.recaptchaToken || '').trim();

    // In non-production, allow requests through if no token is provided
    if (!recaptchaToken) {
      if (config.NODE_ENV !== 'production') {
        return next();
      }
      throw new BadRequestError('recaptchaToken is required');
    }

    const isValid = await verifyRecaptchaToken(recaptchaToken);
    if (!isValid) {
      throw new ForbiddenError('RECAPTCHA_FAILED');
    }

    next();
  } catch (error) {
    res.sendError(error instanceof Error ? error : new ForbiddenError('RECAPTCHA_FAILED'));
  }
};
