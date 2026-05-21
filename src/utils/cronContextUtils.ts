/**
 * Cron Context Utilities
 * 
 * This module provides utilities for setting up request context for cron jobs.
 */

import { requestContext, RequestContext } from '@context';
import { generateRequestId } from '@utils/requestIdUtils';
import { dateUtils } from '@utils/dateUtils';

/**
 * Run a cron job with proper request context
 */
export const runCronWithContext = async <T>(
  jobName: string, 
  callback: () => Promise<T>
): Promise<T> => {
  const requestId = `[CRON]${jobName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const context: RequestContext = {
    requestId,
    timestamp: dateUtils.toISOString(new Date())
  };
  
  return requestContext.runWithContext(context, callback);
};

