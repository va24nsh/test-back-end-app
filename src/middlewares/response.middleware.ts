import { NextFunction } from 'express';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { dateUtils } from '@utils/dateUtils';
import type { SuccessResponse, ErrorResponse } from '@types';

export const responseMiddleware = (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => {
  // Add sendResponse function to response object with proper typing
  res.sendResponse = <T = unknown>(data: T = {} as T, message: string = '', statusCode: number = 200) => {
    const requestId = req.requestId || '';
    const startTime = req.startTime || Date.now();
    const elapsedTime = `${Date.now() - startTime}ms`;

    const response: SuccessResponse<T> = {
      isSuccess: true,
      message,
      data,
      timestamp: dateUtils.toISOString(new Date()),
      requestId,
      elapsedTime,
    };
    
    res.status(statusCode).json(response);
  };

  // Add sendError function to response object with proper typing
  res.sendError = (error: Error | string, statusCode?: number, errorCode?: string, details?: unknown) => {
    const requestId = req.requestId || '';
    const startTime = req.startTime || Date.now();
    const elapsedTime = `${Date.now() - startTime}ms`;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? 'Error' : error.name;
    
    // Handle custom error objects that have statusCode and code properties
    let finalStatusCode = statusCode || 500;
    let finalErrorCode = errorCode || 'INTERNAL_SERVER_ERROR';
    let finalDetails = details;
    
    if (typeof error === 'object' && error && 'statusCode' in error) {
      finalStatusCode = (error as { statusCode: number }).statusCode;
    }
    
    if (typeof error === 'object' && error && 'code' in error) {
      finalErrorCode = (error as { code: string }).code;
    }

    if (typeof error === 'object' && error && 'details' in error) {
      finalDetails = (error as { details?: unknown }).details || details;
    }
    
    const errorResponse: ErrorResponse = {
      isSuccess: false,
      message: errorMessage,
      error: {
        name: errorName,
        code: finalErrorCode,
        details: finalDetails,
      },
      timestamp: dateUtils.toISOString(new Date()),
      requestId,
      elapsedTime,
    };
    
    res.status(finalStatusCode).json(errorResponse);
  };

  next();
};

