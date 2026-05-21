/**
 * Forbidden Error
 * 
 * Error thrown when the user does not have permission to access a resource.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class ForbiddenError extends GenericError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(message, ErrorCodes.FORBIDDEN, 403, true, details);
  }
}

