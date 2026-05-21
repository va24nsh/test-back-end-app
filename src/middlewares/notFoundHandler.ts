import { NextFunction } from 'express';
import { NotFoundError } from '@errors';
import { logger } from '@utils/logger';
import { ExtendedRequest, ExtendedResponse } from '@types';

export const notFoundHandler = (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    url: req.url,
    requestId: (req as ExtendedRequest).requestId
  });
  
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  return res.sendError(error);
};

