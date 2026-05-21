/**
 * Unprocessable Entity Error
 * 
 * Error thrown when the request is well-formed but semantically incorrect.
 * HTTP 422 - The request was well-formed but contains semantic errors.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class UnprocessableEntityError extends GenericError {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string = 'Unprocessable Entity',
    fieldErrors?: Record<string, string[]>,
    details?: unknown
  ) {
    super(message, ErrorCodes.UNPROCESSABLE_ENTITY, 422, true, details);
    this.fieldErrors = fieldErrors;
  }
}

