import { config } from '@config/environment';
import { UnauthorizedError, BadRequestError, BadGatewayError } from '@errors';
import { LoggerFactory } from '@adapters';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('FirebaseEmailVerify');

export interface EmailLinkVerifyResult {
  email: string;
  localId: string;
  idToken: string;
}

/**
 * Verifies an email sign-in link oobCode via the Firebase Identity Platform REST API.
 *
 * Endpoint: POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key={API_KEY}
 *
 * @param oobCode - The out-of-band code extracted from the email magic link
 * @param email - The email address used to request the magic link
 * @returns The verified email, Firebase UID (localId), and idToken
 * @throws UnauthorizedError if oobCode is invalid or expired
 * @throws BadRequestError if the email is not found
 * @throws BadGatewayError if the Firebase REST API is unreachable or returns an unexpected error
 */
export async function verifyEmailLinkOobCode(
  oobCode: string,
  email: string
): Promise<EmailLinkVerifyResult> {
  const apiKey = config.FIREBASE_WEB_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key=${apiKey}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode, email }),
    });
  } catch (error) {
    logger.error('Firebase email verify network error:', {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new BadGatewayError('Failed to verify email link — Firebase service unreachable', {
      code: 'EMAIL_VERIFY_FAILED',
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const firebaseErrorCode = errorBody?.error?.message ?? '';

    logger.error('Firebase email verify API error:', {
      statusCode: response.status,
      firebaseErrorCode,
    });

    throw mapFirebaseError(firebaseErrorCode);
  }

  const data = await response.json();

  return {
    email: data.email,
    localId: data.localId,
    idToken: data.idToken,
  };
}

/**
 * Maps Firebase Identity Platform error codes to application error classes.
 */
function mapFirebaseError(errorCode: string): Error {
  if (errorCode.includes('INVALID_OOB_CODE') || errorCode.includes('EXPIRED_OOB_CODE')) {
    return new UnauthorizedError('Invalid or expired email link', {
      code: 'INVALID_EMAIL_LINK',
    });
  }

  if (errorCode.includes('EMAIL_NOT_FOUND')) {
    return new BadRequestError('Email not found', {
      code: 'EMAIL_NOT_FOUND',
    });
  }

  // Any other Firebase error is treated as a gateway failure
  return new BadGatewayError('Email link verification failed', {
    code: 'EMAIL_VERIFY_FAILED',
    firebaseError: errorCode,
  });
}
