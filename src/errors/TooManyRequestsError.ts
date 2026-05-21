/**
 * Too Many Requests Error
 * 
 * Error thrown when the user has sent too many requests in a given amount of time.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class TooManyRequestsError extends GenericError {
  constructor(message: string = 'Too Many Requests', details?: unknown) {
    super(message, ErrorCodes.TOO_MANY_REQUESTS, 429, true, details);
  }
}

