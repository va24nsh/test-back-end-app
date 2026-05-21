/**
 * Validation Error
 * 
 * Error thrown when data validation fails.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class ValidationError extends GenericError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string = 'Validation Failed',
    fieldErrors: Record<string, string[]> = {},
    details?: unknown
  ) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, true, details);
    this.fieldErrors = fieldErrors;
  }
}

