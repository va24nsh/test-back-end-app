/**
 * MSG91 OTP Widget Provider
 *
 * Implements the MSG91 OTP Widget API flow for a backend-only integration:
 *   Frontend → Backend → MSG91 Widget APIs
 *
 * Widget API docs: https://docs.msg91.com/otp-widget
 *
 * Flow:
 *   1. sendOtp   → POST widgetSendUrl   { identifier, widgetId }                      → { reqId }
 *   2. resendOtp → POST widgetRetryUrl  { identifier, widgetId, reqId }               → { reqId }
 *   3. verifyOtp → POST widgetVerifyUrl { otp, reqId, identifier, widgetId }          → success/fail
 *
 * Phone format: MSG91 Widget expects the number WITHOUT the leading '+'.
 *   E.164 "+919876543210" → "919876543210"
 *
 * reqId handling:
 *   - The server stores its own UUID as the internal reqId (exposed to the client).
 *   - MSG91's correlation ID (providerReqId) is stored in the DB and used for verify/retry.
 *   - The client never sees the MSG91 reqId.
 */

import {
  extractMsg91Error,
  extractReqIdFromSendOtpResponse,
  isMsg91Failure,
  isOtpInvalid,
} from '../otp/msg91Errors';
import { config } from '@config/environment';
import { BadGatewayError, ServiceUnavailableError } from '@errors';
import { LoggerFactory } from '@adapters';
import { randomUUID } from 'crypto';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('Msg91OtpProvider');

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SendOtpInput {
  /** E.164 phone number, e.g. "+919876543210" */
  phone: string;
  /** Internal server-side reqId (UUID) — used for logging only */
  reqId: string;
}

export interface ResendOtpInput {
  /** E.164 phone number */
  phone: string;
  /** MSG91 provider correlation ID stored in DB from the original send */
  previousReqId: string;
  /** New internal server-side reqId (UUID) — used for logging only */
  newReqId: string;
}

export interface VerifyOtpInput {
  /** E.164 phone number */
  phone: string;
  /** OTP digits entered by the user */
  otp: string;
  /** MSG91 provider correlation ID stored in DB */
  reqId: string;
}

export interface SendOtpResponse {
  /** MSG91's reqId — stored in DB, used for verify/retry, never sent to client */
  providerReqId: string;
}

export interface OtpProvider {
  /**
   * Send OTP to phone via MSG91 Widget.
   * Returns MSG91's reqId (providerReqId) to be stored server-side.
   * Throws BadGatewayError on MSG91 errors.
   */
  sendOtp(input: SendOtpInput): Promise<SendOtpResponse>;

  /**
   * Resend OTP using the previous MSG91 reqId.
   * Returns a new providerReqId.
   * Throws BadGatewayError on MSG91 errors.
   */
  resendOtp(input: ResendOtpInput): Promise<SendOtpResponse>;

  /**
   * Verify OTP with MSG91 Widget.
   * Returns void on success.
   * Throws BadGatewayError with tag 'OTP_INVALID' if OTP is wrong.
   * Throws BadGatewayError with tag 'MSG91_VERIFY_FAILED' on provider errors.
   */
  verifyOtp(input: VerifyOtpInput): Promise<void>;
}

// ─── Config helpers ───────────────────────────────────────────────────────────

const getAuthKey = (): string => {
  if (!config.MSG91_AUTH_KEY) throw new ServiceUnavailableError('MSG91_AUTH_KEY is not configured');
  return config.MSG91_AUTH_KEY;
};

const getWidgetId = (): string => {
  if (!config.MSG91_WIDGET_ID) throw new ServiceUnavailableError('MSG91_WIDGET_ID is not configured');
  return config.MSG91_WIDGET_ID;
};

const getSendUrl = (): string => {
  if (!config.MSG91_WIDGET_SEND_URL) throw new ServiceUnavailableError('MSG91_WIDGET_SEND_URL is not configured');
  return config.MSG91_WIDGET_SEND_URL;
};

const getVerifyUrl = (): string => {
  if (!config.MSG91_WIDGET_VERIFY_URL) throw new ServiceUnavailableError('MSG91_WIDGET_VERIFY_URL is not configured');
  return config.MSG91_WIDGET_VERIFY_URL;
};

/** Falls back to send URL when retry URL is not configured. */
const getRetryUrl = (): string => config.MSG91_WIDGET_RETRY_URL || getSendUrl();

// ─── Phone normalization ──────────────────────────────────────────────────────

/**
 * MSG91 Widget expects the phone number WITHOUT the leading '+'.
 * E.164 "+919876543210" → "919876543210"
 */
const normalizeForMsg91 = (phone: string): string =>
  phone.startsWith('+') ? phone.slice(1) : phone;

// ─── Sanitized logging ────────────────────────────────────────────────────────

function maskPhone(phone: string): string {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `${digits.slice(0, 2)}****${digits.slice(-2)}`;
}

function sanitizeBody(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeBody);

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (key.includes('authkey') || key.includes('authorization')) {
      out[k] = '***';
    } else if (key === 'otp') {
      out[k] = '***';
    } else if (key.includes('token') || key === 'access-token' || key === 'accesstoken') {
      out[k] = '***';
    } else if (key === 'identifier' || key.includes('mobile') || key.includes('phone')) {
      out[k] = typeof v === 'string' ? maskPhone(v) : v;
    } else {
      out[k] = sanitizeBody(v);
    }
  }
  return out;
}

// ─── Core HTTP helper ─────────────────────────────────────────────────────────

/**
 * POST to a MSG91 Widget endpoint.
 *
 * - Logs request (sanitized) and response.
 * - Throws a tagged BadGatewayError on network errors.
 * - Returns the parsed response body; callers decide whether it's a success or failure.
 */
async function postToMsg91(
  operationName: string,
  url: string,
  payload: Record<string, string>,
): Promise<{ response: Response; responseBody: any }> {
  const rid = randomUUID();

  logger.info(`MSG91 ${operationName} request`, {
    rid,
    url,
    body: sanitizeBody(payload),
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: getAuthKey(),
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    logger.error(`MSG91 ${operationName} network error`, {
      rid,
      url,
      error: networkError instanceof Error ? networkError.message : String(networkError),
    });
    const err = new BadGatewayError('OTP_PROVIDER_UNAVAILABLE');
    (err as any).tag = 'MSG91_NETWORK_ERROR';
    throw err;
  }

  const rawText = await response.text();
  let responseBody: any;
  try {
    responseBody = JSON.parse(rawText);
  } catch {
    responseBody = { raw: rawText };
  }

  logger.info(`MSG91 ${operationName} response`, {
    rid,
    httpStatus: response.status,
    body: sanitizeBody(responseBody),
  });

  return { response, responseBody };
}

// ─── Provider implementation ──────────────────────────────────────────────────

export class Msg91OtpProvider implements OtpProvider {
  /**
   * Send OTP via MSG91 Widget.
   *
   * Correct widget payload:
   *   { identifier: "91XXXXXXXXXX", widgetId: "<MSG91_WIDGET_ID>" }
   * Headers:
   *   { authkey: "<MSG91_AUTH_KEY>", Content-Type: "application/json" }
   *
   * Success response contains MSG91's reqId (correlation ID).
   */
  async sendOtp(input: SendOtpInput): Promise<SendOtpResponse> {
    const identifier = normalizeForMsg91(input.phone);
    const widgetId = getWidgetId();

    const { response, responseBody } = await postToMsg91('sendOtp', getSendUrl(), {
      identifier,
      widgetId,
    });

    if (isMsg91Failure(response, responseBody)) {
      const error = extractMsg91Error(responseBody);
      logger.warn('MSG91 sendOtp: failed', {
        internalReqId: input.reqId,
        errorCode: error.code,
        message: error.message,
      });
      const err = new BadGatewayError('OTP_SEND_FAILED');
      (err as any).tag = 'MSG91_SEND_FAILED';
      throw err;
    }

    // Extract MSG91's reqId from the response.
    // The widget may return it as data.reqId or (quirk) as data.message on success.
    const providerReqId = extractReqIdFromSendOtpResponse(responseBody);
    if (!providerReqId) {
      logger.error('MSG91 sendOtp: no reqId in response', {
        internalReqId: input.reqId,
        responseBody: sanitizeBody(responseBody),
      });
      const err = new BadGatewayError('OTP_SEND_FAILED');
      (err as any).tag = 'MSG91_SEND_FAILED';
      throw err;
    }

    logger.info('MSG91 sendOtp: success', { internalReqId: input.reqId });
    return { providerReqId };
  }

  /**
   * Resend OTP via MSG91 Widget retry endpoint.
   *
   * Correct widget payload:
   *   { identifier: "91XXXXXXXXXX", widgetId: "...", reqId: "<msg91-reqId>" }
   */
  async resendOtp(input: ResendOtpInput): Promise<SendOtpResponse> {
    const identifier = normalizeForMsg91(input.phone);
    const widgetId = getWidgetId();

    const { response, responseBody } = await postToMsg91('resendOtp', getRetryUrl(), {
      identifier,
      widgetId,
      reqId: input.previousReqId,
    });

    if (isMsg91Failure(response, responseBody)) {
      const error = extractMsg91Error(responseBody);
      logger.warn('MSG91 resendOtp: failed', {
        internalReqId: input.newReqId,
        errorCode: error.code,
        message: error.message,
      });
      const err = new BadGatewayError('OTP_SEND_FAILED');
      (err as any).tag = 'MSG91_SEND_FAILED';
      throw err;
    }

    const providerReqId = extractReqIdFromSendOtpResponse(responseBody);
    if (!providerReqId) {
      logger.error('MSG91 resendOtp: no reqId in response', {
        internalReqId: input.newReqId,
        responseBody: sanitizeBody(responseBody),
      });
      const err = new BadGatewayError('OTP_SEND_FAILED');
      (err as any).tag = 'MSG91_SEND_FAILED';
      throw err;
    }

    logger.info('MSG91 resendOtp: success', { internalReqId: input.newReqId });
    return { providerReqId };
  }

  /**
   * Verify OTP via MSG91 Widget.
   *
   * Correct widget payload:
   *   { otp: "...", reqId: "<msg91-reqId>", identifier: "91XXXXXXXXXX", widgetId: "..." }
   *
   * IMPORTANT: `identifier` and `widgetId` are REQUIRED by the widget verify endpoint.
   * Omitting them causes AuthenticationFailure (code 418) even with a valid authkey.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<void> {
    const identifier = normalizeForMsg91(input.phone);
    const widgetId = getWidgetId();

    // Never log the OTP value itself
    logger.info('MSG91 verifyOtp: sending request', {
      identifier: maskPhone(identifier),
      reqId: input.reqId,
    });

    const { response, responseBody } = await postToMsg91('verifyOtp', getVerifyUrl(), {
      otp: input.otp,
      reqId: input.reqId,
      identifier,
      widgetId,
    });

    // Provider-level failure (auth/config/network errors)
    if (isMsg91Failure(response, responseBody)) {
      const error = extractMsg91Error(responseBody);
      logger.warn('MSG91 verifyOtp: provider failure', {
        errorCode: error.code,
        message: error.message,
      });
      const err = new BadGatewayError('OTP_VERIFY_FAILED');
      (err as any).tag = 'MSG91_VERIFY_FAILED';
      throw err;
    }

    // Invalid/expired OTP — HTTP 200 but OTP is wrong
    if (isOtpInvalid(responseBody)) {
      logger.info('MSG91 verifyOtp: invalid OTP');
      const err = new BadGatewayError('OTP_INVALID');
      (err as any).tag = 'OTP_INVALID';
      throw err;
    }

    logger.info('MSG91 verifyOtp: success');
    // void — success
  }
}

// Named export alias used in auth.controller.ts
export { Msg91OtpProvider as FirebaseOtpProvider };
