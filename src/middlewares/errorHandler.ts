import { NextFunction } from 'express';
import { GenericError, InternalServerError } from '@errors';
import { LoggerFactory } from '@adapters';
import { ExtendedRequest, ExtendedResponse } from '@types';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('ErrorHandler');

export const errorHandler = (
  err: Error | GenericError,
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
) => {
  const safeSendError = (error: Error | GenericError) => {
    if (typeof res.sendError === 'function') {
      return res.sendError(error);
    }

    const fallbackStatus =
      typeof error === 'object' && error && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500;

    const fallbackCode =
      typeof error === 'object' && error && 'code' in error
        ? (error as { code: string }).code
        : 'INTERNAL_SERVER_ERROR';

    return res.status(fallbackStatus).json({
      isSuccess: false,
      message: error.message,
      error: {
        name: error.name,
        code: fallbackCode,
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId || '',
      elapsedTime: `${Date.now() - (req.startTime || Date.now())}ms`,
    });
  };

  // Check if it's one of our custom errors (GenericError)
  const isOurError = err instanceof GenericError;

  if (isOurError) {
    // It's one of our custom errors, send it as is
    logger.error('Operational error', { 
      errorName: err.name,
      errorMessage: err.message,
      errorCode: (err as GenericError).code,
      requestId: req.requestId 
    });
    return safeSendError(err);
  }

  logger.error('Unhandled error', { 
    errorName: err.name,
    errorMessage: err.message,
    errorStack: err.stack,
    requestId: req.requestId 
  });

  // Send internal server error for all unhandled errors
  return safeSendError(
    new InternalServerError('Something went wrong - Internal Server Error')
  );
};
