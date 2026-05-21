/**
 * Not Implemented Error
 * 
 * Error thrown when a requested feature is not implemented.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class NotImplementedError extends GenericError {
  constructor(message: string = 'Not Implemented', details?: unknown) {
    super(message, ErrorCodes.NOT_IMPLEMENTED, 501, true, details);
  }
}

