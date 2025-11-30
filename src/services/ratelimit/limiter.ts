import { ErrorType, DashboardError } from '../../types';

// Rate Limit Configuration: 12 requests per hour per endpoint
export const RATE_LIMIT_CONFIG = {
  maxRequests: 12,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const;

interface RequestRecord {
  timestamp: number;
}

/**
 * RateLimiter service for preventing excessive API calls
 * Implements per-endpoint rate limiting with configurable limits
 */
export class RateLimiter {
  private requests: Map<string, RequestRecord[]>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = RATE_LIMIT_CONFIG.maxRequests, windowMs: number = RATE_LIMIT_CONFIG.windowMs) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request can be made to the specified endpoint
   * Returns true if within rate limit, false otherwise
   */
  canMakeRequest(endpoint: string): boolean {
    try {
      this.cleanupOldRequests(endpoint);
      
      const endpointRequests = this.requests.get(endpoint) || [];
      return endpointRequests.length < this.maxRequests;
    } catch (error) {
      this.handleRateLimitError(error, 'canMakeRequest');
      return false;
    }
  }

  /**
   * Record a request to the specified endpoint
   * Should be called after making an API request
   */
  recordRequest(endpoint: string): void {
    try {
      this.cleanupOldRequests(endpoint);
      
      const endpointRequests = this.requests.get(endpoint) || [];
      
      endpointRequests.push({
        timestamp: Date.now(),
      });
      
      this.requests.set(endpoint, endpointRequests);
    } catch (error) {
      this.handleRateLimitError(error, 'recordRequest');
    }
  }

  /**
   * Get the number of remaining requests for the specified endpoint
   */
  getRemainingRequests(endpoint: string): number {
    try {
      this.cleanupOldRequests(endpoint);
      
      const endpointRequests = this.requests.get(endpoint) || [];
      return Math.max(0, this.maxRequests - endpointRequests.length);
    } catch (error) {
      this.handleRateLimitError(error, 'getRemainingRequests');
      return 0;
    }
  }

  /**
   * Get the time until the next request can be made (in milliseconds)
   * Returns 0 if requests can be made immediately
   */
  getTimeUntilNextRequest(endpoint: string): number {
    try {
      this.cleanupOldRequests(endpoint);
      
      const endpointRequests = this.requests.get(endpoint) || [];
      
      if (endpointRequests.length < this.maxRequests) {
        return 0;
      }
      
      // Find the oldest request
      const oldestRequest = endpointRequests[0];
      const timeUntilExpiry = (oldestRequest.timestamp + this.windowMs) - Date.now();
      
      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      this.handleRateLimitError(error, 'getTimeUntilNextRequest');
      return this.windowMs;
    }
  }

  /**
   * Reset rate limit for a specific endpoint or all endpoints
   */
  reset(endpoint?: string): void {
    try {
      if (endpoint) {
        this.requests.delete(endpoint);
      } else {
        this.requests.clear();
      }
    } catch (error) {
      this.handleRateLimitError(error, 'reset');
    }
  }

  /**
   * Get all tracked endpoints
   */
  getEndpoints(): string[] {
    try {
      return Array.from(this.requests.keys());
    } catch (error) {
      this.handleRateLimitError(error, 'getEndpoints');
      return [];
    }
  }

  /**
   * Clean up old requests that are outside the time window
   */
  private cleanupOldRequests(endpoint: string): void {
    const endpointRequests = this.requests.get(endpoint);
    
    if (!endpointRequests) {
      return;
    }
    
    const now = Date.now();
    const validRequests = endpointRequests.filter(
      (record) => now - record.timestamp < this.windowMs
    );
    
    if (validRequests.length === 0) {
      this.requests.delete(endpoint);
    } else {
      this.requests.set(endpoint, validRequests);
    }
  }

  /**
   * Handle rate limiter errors
   */
  private handleRateLimitError(error: unknown, operation: string): void {
    const message = error instanceof Error ? error.message : 'Unknown rate limit error';
    console.error(`RateLimiter.${operation} error:`, message);
    
    throw new DashboardError(
      ErrorType.RATE_LIMIT_ERROR,
      `Rate limit operation failed: ${operation} - ${message}`,
      false
    );
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
