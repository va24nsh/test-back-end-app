/**
 * Date Utilities
 * 
 * Utility functions for date operations.
 */

export const dateUtils = {
  /**
   * Convert date to ISO string
   */
  toISOString: (date: Date): string => {
    return date.toISOString();
  },

  /**
   * Get current timestamp
   */
  now: (): Date => {
    return new Date();
  },

  /**
   * Format date
   */
  format: (date: Date, format: string = 'YYYY-MM-DD'): string => {
    // Simple implementation - can be enhanced with date-fns or moment
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  },
};

