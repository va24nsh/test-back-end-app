/**
 * Service Unavailable Error
 * 
 * Error thrown when the service is temporarily unavailable.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class ServiceUnavailableError extends GenericError {
  constructor(message: string = 'Service Unavailable', details?: unknown) {
    super(message, ErrorCodes.SERVICE_UNAVAILABLE, 503, true, details);
  }
}

