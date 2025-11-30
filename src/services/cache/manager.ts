import type { CacheEntry, FreshnessLevel } from '../../types';
import { ErrorType, DashboardError } from '../../types';

// Cache TTL Configuration
export const CACHE_CONFIG = {
  cycloneData: 5 * 60 * 1000, // 5 minutes
  districtRainfall: 5 * 60 * 1000, // 5 minutes
  updates: 5 * 60 * 1000, // 5 minutes
  travelRoute: 10 * 60 * 1000, // 10 minutes
} as const;

// Freshness Thresholds
export const FRESHNESS_THRESHOLDS = {
  fresh: 15 * 60 * 1000, // 15 minutes
  yellow: 30 * 60 * 1000, // 30 minutes
  orange: 60 * 60 * 1000, // 60 minutes
} as const;

/**
 * CacheManager service for managing in-memory cache with TTL and freshness indicators
 * Implements caching strategy to reduce API calls and improve performance
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data by key
   * Returns null if key doesn't exist or data is expired
   */
  get<T>(key: string): CacheEntry<T> | null {
    try {
      const entry = this.cache.get(key) as CacheEntry<T> | undefined;
      
      if (!entry) {
        return null;
      }

      // Check if cache entry is still valid
      if (!this.isValid(key)) {
        this.cache.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      this.handleCacheError(error, 'get');
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: new Date(),
        ttl,
      };

      this.cache.set(key, entry as CacheEntry<unknown>);
    } catch (error) {
      this.handleCacheError(error, 'set');
    }
  }

  /**
   * Check if cached data is still valid (not expired)
   */
  isValid(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return false;
      }

      const age = Date.now() - entry.timestamp.getTime();
      return age < entry.ttl;
    } catch (error) {
      this.handleCacheError(error, 'isValid');
      return false;
    }
  }

  /**
   * Get freshness level of cached data
   * Returns color-coded freshness indicator based on age
   */
  getFreshness(key: string): FreshnessLevel {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return 'stale-red';
      }

      const age = Date.now() - entry.timestamp.getTime();

      if (age < FRESHNESS_THRESHOLDS.fresh) {
        return 'fresh';
      } else if (age < FRESHNESS_THRESHOLDS.yellow) {
        return 'stale-yellow';
      } else if (age < FRESHNESS_THRESHOLDS.orange) {
        return 'stale-orange';
      } else {
        return 'stale-red';
      }
    } catch (error) {
      this.handleCacheError(error, 'getFreshness');
      return 'stale-red';
    }
  }

  /**
   * Clear cache
   * If key is provided, clears only that entry
   * If no key provided, clears entire cache
   */
  clear(key?: string): void {
    try {
      if (key) {
        this.cache.delete(key);
      } else {
        this.cache.clear();
      }
    } catch (error) {
      this.handleCacheError(error, 'clear');
    }
  }

  /**
   * Get the age of cached data in milliseconds
   */
  getAge(key: string): number | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }

      return Date.now() - entry.timestamp.getTime();
    } catch (error) {
      this.handleCacheError(error, 'getAge');
      return null;
    }
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    try {
      return Array.from(this.cache.keys());
    } catch (error) {
      this.handleCacheError(error, 'getKeys');
      return [];
    }
  }

  /**
   * Get cache size (number of entries)
   */
  getSize(): number {
    try {
      return this.cache.size;
    } catch (error) {
      this.handleCacheError(error, 'getSize');
      return 0;
    }
  }

  /**
   * Handle cache errors
   */
  private handleCacheError(error: unknown, operation: string): void {
    const message = error instanceof Error ? error.message : 'Unknown cache error';
    console.error(`CacheManager.${operation} error:`, message);
    
    throw new DashboardError(
      ErrorType.UNKNOWN_ERROR,
      `Cache operation failed: ${operation} - ${message}`,
      false
    );
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
