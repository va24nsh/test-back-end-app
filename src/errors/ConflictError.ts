/**
 * Conflict Error
 * 
 * Error thrown when a request conflicts with the current state of the resource.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class ConflictError extends GenericError {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(message, ErrorCodes.BAD_REQUEST, 409, true, details);
  }
}

