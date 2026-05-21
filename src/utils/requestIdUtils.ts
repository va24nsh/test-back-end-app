/**
 * Request ID Utilities
 * 
 * This module provides utilities for generating and managing request IDs
 * for end-to-end request tracing across the application.
 */

import { randomUUID } from 'crypto';
import { dateUtils } from '@utils/dateUtils';

/**
 * Generate a unique request ID
 * @returns A unique request ID string
 */
export const generateRequestId = (): string => {
  return `${randomUUID()}`;
};

/**
 * Extract request ID from headers or generate a new one
 * @param headers Request headers
 * @returns Request ID string
 */
export const getOrGenerateRequestId = (headers: any): string => {
  return headers['x-request-id'] || generateRequestId();
};

/**
 * Create request context object with request ID and other metadata
 * @param headers Request headers
 * @param method HTTP method
 * @param url Request URL
 * @returns Request context object
 */
export const createRequestContext = (headers: any, method: string, url: string) => {
  return {
    requestId: getOrGenerateRequestId(headers),
    method,
    url,
    userId: headers['x-user-id'],
    timestamp: dateUtils.toISOString(new Date())
  };
};

