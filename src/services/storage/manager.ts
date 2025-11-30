import type { SavedRoute, ChecklistState, Language } from '../../types';
import { ErrorType, DashboardError } from '../../types';

// Storage configuration constants
const STORAGE_CONFIG = {
  maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
};

// Storage keys
const STORAGE_KEYS = {
  LAST_CYCLONE: 'cyclone_last_viewed',
  SAVED_ROUTES: 'cyclone_saved_routes',
  CHECKLIST_STATE: 'cyclone_checklist_state',
  LANGUAGE_PREFERENCE: 'cyclone_language_preference',
} as const;

interface StoredData<T> {
  data: T;
  timestamp: number;
}

/**
 * StorageManager service for managing Local Storage operations
 * Handles cyclone ID, saved routes, checklist state, and language preference
 * Implements automatic cleanup and quota management
 */
export class StorageManager {
  /**
   * Save the last viewed cyclone ID
   */
  saveLastCyclone(cycloneId: string): void {
    try {
      const stored: StoredData<string> = {
        data: cycloneId,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.LAST_CYCLONE, JSON.stringify(stored));
    } catch (error) {
      this.handleStorageError(error, 'saveLastCyclone');
    }
  }

  /**
   * Get the last viewed cyclone ID
   */
  getLastCyclone(): string | null {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.LAST_CYCLONE);
      if (!item) return null;

      const stored: StoredData<string> = JSON.parse(item);
      
      // Check if data is expired
      if (this.isExpired(stored.timestamp)) {
        this.deleteItem(STORAGE_KEYS.LAST_CYCLONE);
        return null;
      }

      return stored.data;
    } catch (error) {
      this.handleStorageError(error, 'getLastCyclone');
      return null;
    }
  }

  /**
   * Save a travel route
   */
  saveRoute(route: SavedRoute): void {
    try {
      const routes = this.getSavedRoutes();
      
      // Check if route already exists (by source and destination)
      const existingIndex = routes.findIndex(
        (r) => r.source === route.source && r.destination === route.destination
      );

      if (existingIndex >= 0) {
        // Update existing route
        routes[existingIndex] = route;
      } else {
        // Add new route
        routes.push(route);
      }

      const stored: StoredData<SavedRoute[]> = {
        data: routes,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(stored));
      
      // Check storage quota after saving
      this.manageStorageQuota();
    } catch (error) {
      this.handleStorageError(error, 'saveRoute');
    }
  }

  /**
   * Get all saved routes
   */
  getSavedRoutes(): SavedRoute[] {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.SAVED_ROUTES);
      if (!item) return [];

      const stored: StoredData<SavedRoute[]> = JSON.parse(item);
      
      // Check if data is expired
      if (this.isExpired(stored.timestamp)) {
        this.deleteItem(STORAGE_KEYS.SAVED_ROUTES);
        return [];
      }

      // Convert savedAt strings back to Date objects
      return stored.data.map((route) => ({
        ...route,
        savedAt: new Date(route.savedAt),
      }));
    } catch (error) {
      this.handleStorageError(error, 'getSavedRoutes');
      return [];
    }
  }

  /**
   * Delete a specific route by ID
   */
  deleteRoute(routeId: string): void {
    try {
      const routes = this.getSavedRoutes();
      const filteredRoutes = routes.filter((r) => r.id !== routeId);

      const stored: StoredData<SavedRoute[]> = {
        data: filteredRoutes,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(stored));
    } catch (error) {
      this.handleStorageError(error, 'deleteRoute');
    }
  }

  /**
   * Save checklist state
   */
  saveChecklistState(state: ChecklistState): void {
    try {
      const stored: StoredData<ChecklistState> = {
        data: state,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.CHECKLIST_STATE, JSON.stringify(stored));
      
      // Check storage quota after saving
      this.manageStorageQuota();
    } catch (error) {
      this.handleStorageError(error, 'saveChecklistState');
    }
  }

  /**
   * Get checklist state
   */
  getChecklistState(): ChecklistState {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.CHECKLIST_STATE);
      if (!item) {
        return {
          items: {},
          lastUpdated: new Date(),
        };
      }

      const stored: StoredData<ChecklistState> = JSON.parse(item);
      
      // Check if data is expired
      if (this.isExpired(stored.timestamp)) {
        this.deleteItem(STORAGE_KEYS.CHECKLIST_STATE);
        return {
          items: {},
          lastUpdated: new Date(),
        };
      }

      return {
        ...stored.data,
        lastUpdated: new Date(stored.data.lastUpdated),
      };
    } catch (error) {
      this.handleStorageError(error, 'getChecklistState');
      return {
        items: {},
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Save language preference
   */
  saveLanguagePreference(lang: Language): void {
    try {
      const stored: StoredData<Language> = {
        data: lang,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, JSON.stringify(stored));
    } catch (error) {
      this.handleStorageError(error, 'saveLanguagePreference');
    }
  }

  /**
   * Get language preference
   */
  getLanguagePreference(): Language | null {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
      if (!item) return null;

      const stored: StoredData<Language> = JSON.parse(item);
      
      // Language preference doesn't expire
      return stored.data;
    } catch (error) {
      this.handleStorageError(error, 'getLanguagePreference');
      return null;
    }
  }

  /**
   * Clear data older than the specified age
   */
  clearOldData(maxAgeMs: number = STORAGE_CONFIG.maxAgeMs): void {
    try {
      const keys = Object.values(STORAGE_KEYS);
      
      for (const key of keys) {
        // Skip language preference (doesn't expire)
        if (key === STORAGE_KEYS.LANGUAGE_PREFERENCE) continue;

        const item = localStorage.getItem(key);
        if (!item) continue;

        try {
          const stored: StoredData<unknown> = JSON.parse(item);
          
          if (this.isExpired(stored.timestamp, maxAgeMs)) {
            localStorage.removeItem(key);
          }
        } catch {
          // If parsing fails, remove the corrupted item
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      this.handleStorageError(error, 'clearOldData');
    }
  }

  /**
   * Clear all dashboard data from Local Storage
   */
  clearAll(): void {
    try {
      const keys = Object.values(STORAGE_KEYS);
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      this.handleStorageError(error, 'clearAll');
    }
  }

  /**
   * Get the current storage size in bytes
   */
  getStorageSize(): number {
    try {
      let totalSize = 0;
      const keys = Object.values(STORAGE_KEYS);
      
      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          // Calculate size in bytes (UTF-16 encoding, 2 bytes per character)
          totalSize += item.length * 2;
        }
      }
      
      return totalSize;
    } catch (error) {
      this.handleStorageError(error, 'getStorageSize');
      return 0;
    }
  }

  /**
   * Manage storage quota by removing oldest entries if limit exceeded
   */
  private manageStorageQuota(): void {
    try {
      const currentSize = this.getStorageSize();
      
      if (currentSize > STORAGE_CONFIG.maxSizeBytes) {
        // Get all stored items with timestamps
        const items: Array<{ key: string; timestamp: number; size: number }> = [];
        
        for (const key of Object.values(STORAGE_KEYS)) {
          // Skip language preference (should never be removed)
          if (key === STORAGE_KEYS.LANGUAGE_PREFERENCE) continue;

          const item = localStorage.getItem(key);
          if (!item) continue;

          try {
            const stored: StoredData<unknown> = JSON.parse(item);
            items.push({
              key,
              timestamp: stored.timestamp,
              size: item.length * 2,
            });
          } catch {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }

        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest items until under quota
        let removedSize = 0;
        for (const item of items) {
          if (currentSize - removedSize <= STORAGE_CONFIG.maxSizeBytes) {
            break;
          }
          
          localStorage.removeItem(item.key);
          removedSize += item.size;
        }
      }
    } catch (error) {
      this.handleStorageError(error, 'manageStorageQuota');
    }
  }

  /**
   * Check if a timestamp is expired
   */
  private isExpired(timestamp: number, maxAge: number = STORAGE_CONFIG.maxAgeMs): boolean {
    return Date.now() - timestamp > maxAge;
  }

  /**
   * Delete a specific item from storage
   */
  private deleteItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.handleStorageError(error, 'deleteItem');
    }
  }

  /**
   * Handle storage errors
   */
  private handleStorageError(error: unknown, operation: string): void {
    const message = error instanceof Error ? error.message : 'Unknown storage error';
    console.error(`StorageManager.${operation} error:`, message);
    
    throw new DashboardError(
      ErrorType.STORAGE_ERROR,
      `Storage operation failed: ${operation} - ${message}`,
      false
    );
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
