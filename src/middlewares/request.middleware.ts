/**
 * Request ID Middleware
 * 
 * This middleware generates and attaches a unique request ID to each request
 * for end-to-end request tracing across the application.
 */

import { NextFunction } from 'express';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { getOrGenerateRequestId } from '@utils/requestIdUtils';
import { requestContext, RequestContext } from '@context';
import { dateUtils } from '@utils/dateUtils';

export const requestIdMiddleware = (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => {
  // Generate or extract request ID
  const requestId = getOrGenerateRequestId(req.headers);
  
  // Attach request ID to request object
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Add request ID to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  // Add request ID to request headers for downstream use
  req.headers['x-request-id'] = requestId;
  
  // Create initial request context for AsyncLocalStorage
  const context: RequestContext = {
    requestId,
    method: req.method,
    url: req.url,
    timestamp: dateUtils.toISOString(new Date())
  };
  
  // Run the rest of the request with context
  requestContext.runWithContext(context, () => {
    next();
  });
};

/**
 * Update request context after auth middleware runs
 * This should be called after authentication middleware to capture user details
 */
export const updateRequestContext = (req: ExtendedRequest) => {
  const currentContext = requestContext.getContext();
  if (currentContext) {
    // Update context with auth middleware results
    if (req.user) {
      currentContext.userId = req.user.id;
    }
    if (req.firebaseUser) {
      currentContext.firebaseUserId = req.firebaseUser.uid;
    }
  }
};


