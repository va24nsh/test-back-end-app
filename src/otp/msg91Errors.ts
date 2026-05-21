/**
 * MSG91 Error Extraction & Mapping
 *
 * Handles MSG91 Widget API error responses:
 * - Extracts error codes/messages from response body
 * - Handles HTTP 200 + error body case (MSG91 Widget quirk)
 * - Maps MSG91 codes to internal error codes (never expose upstream codes to FE)
 * - Extracts reqId from widget send-OTP success responses
 *
 * Error codes reference:
 * https://msg91.com/help/api/what-are-the-reason-for-error-codes-received-under-the-api-failed
 */

const MSG91_ERROR_MAP: Record<string, string> = {
  '101': 'Missing mobile number',
  '102': 'Missing message',
  '201': 'Invalid username or password',
  '202': 'Invalid mobile number',
  '207': 'Invalid authentication key',
  '208': 'IP is blacklisted',
  '209': 'Default route not found',
  '301': 'Insufficient balance to send SMS',
  '302': 'Expired user account',
  '303': 'Banned user account',
  '306': 'This route is currently unavailable',
  '400': 'Flow ID missing or invalid flow',
  '401': 'Flow not yet approved',
  '403': 'Flow is disabled',
  '418': 'IP not whitelisted — check MSG91 widget IP whitelist settings',
  '421': 'Service terminated — contact MSG91 account manager',
  '506': 'Internal error — contact MSG91 account manager',
  '601': 'Internal error — contact MSG91 account manager',
  '1006': 'Mobile number not in correct format',
  '1007': 'Route not found',
  '1009': 'Insufficient credit in MSG91 account',
  '1010': 'Transmission error',
  '1013': 'Duplicate request submitted',
  '1014': 'Account deactivated — contact MSG91 support',
  '1015': 'Invalid request',
  '1031': 'Authentication failed — invalid authkey',
  '2': 'OTP expired',
  '3': 'OTP verification failed',
  '4': 'Invalid OTP',
  '5': 'Mobile number not found',
};

export interface Msg91ErrorDetails {
  code: string;
  message: string;
}

/**
 * Extract MSG91 error details from response body.
 * Prioritizes upstream message, falls back to mapped code, then generic message.
 */
export function extractMsg91Error(body: any): Msg91ErrorDetails {
  const upstreamCode = String(body?.code ?? body?.type ?? 'UNKNOWN');
  const upstreamMessage = body?.message ?? body?.info ?? null;
  const mappedMessage = MSG91_ERROR_MAP[upstreamCode];

  return {
    code: upstreamCode,
    message: upstreamMessage ?? mappedMessage ?? 'MSG91 request failed',
  };
}

/**
 * Check if a MSG91 Widget API response indicates failure.
 *
 * MSG91 Widget quirks:
 * - May return HTTP 200 with { type: "error", ... } in the body
 * - May return HTTP 200 with { success: false }
 * - May return HTTP 200 with { hasError: true }
 * - Explicit HTTP 4xx/5xx always means failure
 *
 * NOTE: We do NOT flag responses just because they contain a numeric `code`
 * field — success responses can also carry status codes. We only flag
 * responses that have explicit error indicators.
 */
export function isMsg91Failure(res: Response, body: any): boolean {
  // HTTP-level failure
  if (!res.ok) {
    return true;
  }

  // Explicit error type in body
  if (typeof body?.type === 'string' && body.type.toLowerCase() === 'error') {
    return true;
  }

  // Explicit fail status in body
  if (typeof body?.status === 'string' && body.status.toLowerCase() === 'fail') {
    return true;
  }

  // Explicit hasError flag
  if (body?.hasError === true) {
    return true;
  }

  // Explicit success=false
  if (body?.success === false) {
    return true;
  }

  // MSG91 Widget returns { "message": "AuthenticationFailure", "code": "418" } on auth failure.
  // We detect this by checking for known failure message patterns alongside a numeric code.
  if (
    typeof body?.message === 'string' &&
    /failure|error|failed|invalid/i.test(body.message) &&
    typeof body?.code === 'string' &&
    /^\d+$/.test(body.code)
  ) {
    return true;
  }

  return false;
}

/**
 * Check if OTP verification failed (invalid/expired OTP).
 * MSG91 Widget may return HTTP 200 with a failure body for invalid OTPs.
 */
export function isOtpInvalid(body: any): boolean {
  const normalized = JSON.stringify(body ?? '').toLowerCase();
  return (
    normalized.includes('invalid otp') ||
    normalized.includes('otp expired') ||
    normalized.includes('wrong otp') ||
    normalized.includes('max retry attempted') ||
    normalized.includes('otp not matched') ||
    body?.success === false
  );
}

/**
 * Extract the reqId from a MSG91 Widget sendOtp success response.
 *
 * The widget API is inconsistent about where it puts the reqId:
 * - Sometimes: { reqId: "abc123" }
 * - Sometimes: { data: { reqId: "abc123" } }
 * - Sometimes: { type: "success", message: "abc123" }  (reqId in message field)
 *
 * Returns undefined if no reqId can be found.
 */
export function extractReqIdFromSendOtpResponse(data: any): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  // Direct fields
  const direct =
    data.reqId ??
    data?.data?.reqId ??
    data?.response?.reqId ??
    data?.result?.reqId;

  if (typeof direct === 'string' && direct.length > 0) return direct;

  // MSG91 Widget sometimes puts reqId in `message` for success responses.
  // reqId is alphanumeric, at least 8 chars.
  const type = String(data.type ?? '').toLowerCase();
  if (
    type === 'success' &&
    typeof data.message === 'string' &&
    /^[a-zA-Z0-9]{8,}$/.test(data.message)
  ) {
    return data.message;
  }

  return undefined;
}
