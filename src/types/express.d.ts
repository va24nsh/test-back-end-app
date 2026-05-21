import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request interface with custom headers and properties
 * This provides type safety for custom headers like x-cryptid, etc.
 */
export interface ExtendedRequest extends Request {
  body?: Record<string, unknown>;
  method: string;
  path: string;
  url: string;
  // Custom headers
  headers: Request['headers'] & {
    'x-cryptid'?: string;
    'x-user-id'?: string;
    'authorization'?: string;
    'x-request-id'?: string;
    'x-timestamp'?: string;
    'x-version'?: string;
  };
  
  // Custom properties that middleware might add
  userId?: string;
  cryptId?: string;
  requestId?: string;
  ipAddress?: string;
  startTime?: number;
  params: Request['params'];
  query: Request['query'];
  user?: {
    id?: string;
    email: string;
    firebaseUserId?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    isVerified?: boolean;
    isOnboarded?: boolean;
    provider?: string[];
  };
  firebaseUser?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoURL?: string;
  };
}

/**
 * Extended Response interface with custom methods
 * This provides type safety for res.sendResponse() and res.sendError()
 */
export interface ExtendedResponse extends Response {
  status(code: number): ExtendedResponse;
  json(body?: unknown): ExtendedResponse;
  setHeader(name: string, value: string | number | string[]): ExtendedResponse;
  /**
   * Send successful response with data
   */
  sendResponse<T = unknown>(data?: T, message?: string, status?: number): void;
  
  /**
   * Send error response
   */
  sendError(error: Error | string, status?: number, errorCode?: string, details?: unknown): void;
}

/**
 * Type for request handlers that use our extended request and response
 */
export type RequestHandler = (req: ExtendedRequest, res: ExtendedResponse, next?: NextFunction) => void | Promise<void>;

declare global {
  namespace Express {
    interface Request extends ExtendedRequest {}
    interface Response extends ExtendedResponse {}
  }
}

export {};

