/**
 * Gateway Timeout Error
 * 
 * Error thrown when a gateway or proxy server times out.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class GatewayTimeoutError extends GenericError {
  constructor(message: string = 'Gateway Timeout', details?: unknown) {
    super(message, ErrorCodes.GATEWAY_TIMEOUT, 504, true, details);
  }
}

