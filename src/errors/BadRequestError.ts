/**
 * Bad Request Error
 * 
 * Error thrown when the request is malformed or invalid.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class BadRequestError extends GenericError {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(message, ErrorCodes.BAD_REQUEST, 400, true, details);
  }
}

