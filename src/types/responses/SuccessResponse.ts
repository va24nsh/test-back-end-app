/**
 * Success Response Types
 * 
 * This module contains types for success responses.
 */

export interface SuccessResponse<T = unknown> {
  isSuccess: true;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
  elapsedTime?: string;
}

