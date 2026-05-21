/**
 * Request Context
 * 
 * This module provides request context management using AsyncLocalStorage
 * for automatic request ID propagation across the application.
 */

import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  userId?: string;
  method?: string;
  url?: string;
  timestamp: string;
  firebaseUserId?: string;
}

class RequestContextManager {
  private static instance: RequestContextManager;
  private asyncLocalStorage: AsyncLocalStorage<RequestContext>;

  private constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
  }

  public static getInstance(): RequestContextManager {
    if (!RequestContextManager.instance) {
      RequestContextManager.instance = new RequestContextManager();
    }
    return RequestContextManager.instance;
  }

  /**
   * Run a function with request context
   */
  public runWithContext<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Get current request context
   */
  public getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Get current request ID
   */
  public getRequestId(): string | undefined {
    const context = this.getContext();
    return context?.requestId;
  }

  /**
   * Update context with new values
   */
  public updateContext(updates: Partial<RequestContext>): void {
    const currentContext = this.getContext();
    if (currentContext) {
      Object.assign(currentContext, updates);
    }
  }
}

export const requestContext = RequestContextManager.getInstance();

