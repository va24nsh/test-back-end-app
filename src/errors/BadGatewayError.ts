/**
 * Bad Gateway Error
 * 
 * Error thrown when a gateway or proxy server receives an invalid response.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class BadGatewayError extends GenericError {
  constructor(message: string = 'Bad Gateway', details?: unknown) {
    super(message, ErrorCodes.BAD_GATEWAY, 502, true, details);
  }
}

