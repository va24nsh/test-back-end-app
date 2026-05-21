/**
 * Error Response Types
 * 
 * This module contains types for error responses.
 */

export interface ErrorResponse {
  isSuccess: false;
  message: string;
  error: {
    name: string;
    code: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
  elapsedTime?: string;
}

export interface ErrorResponseWithFieldErrors extends ErrorResponse {
  fieldErrors?: Record<string, string[]>;
}

