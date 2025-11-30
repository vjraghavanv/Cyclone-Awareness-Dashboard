import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from '../../src/services/storage/manager';
import type { SavedRoute, ChecklistState, Language } from '../../src/types';

// **Feature: cyclone-awareness-dashboard, Property 9: Local Storage round-trip consistency**
// **Validates: Requirements 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 15.5**

describe('Property 9: Local Storage round-trip consistency', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    // Clear localStorage before each test - ensure complete cleanup
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
      // Also manually remove any keys that might persist
      const keys = Object.keys(localStorage);
      keys.forEach(key => localStorage.removeItem(key));
    }
    storageManager = new StorageManager();
  });

  afterEach(() => {
    // Clean up after each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
      const keys = Object.keys(localStorage);
      keys.forEach(key => localStorage.removeItem(key));
    }
  });

  // Arbitraries for generating test data
  const cycloneIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  const languageArb = fc.constantFrom<Language>('en', 'ta');

  const savedRouteArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    source: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    destination: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    savedAt: fc.date(),
  }) as fc.Arbitrary<SavedRoute>;

  const checklistStateArb = fc.record({
    items: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.boolean()
    ),
    lastUpdated: fc.date(),
  }) as fc.Arbitrary<ChecklistState>;

  it('should round-trip cyclone ID correctly', () => {
    fc.assert(
      fc.property(cycloneIdArb, (cycloneId) => {
        storageManager.saveLastCyclone(cycloneId);
        const retrieved = storageManager.getLastCyclone();
        expect(retrieved).toBe(cycloneId);
      }),
      { numRuns: 100 }
    );
  });

  it('should round-trip language preference correctly', () => {
    fc.assert(
      fc.property(languageArb, (language) => {
        storageManager.saveLanguagePreference(language);
        const retrieved = storageManager.getLanguagePreference();
        expect(retrieved).toBe(language);
      }),
      { numRuns: 100 }
    );
  });

  it('should round-trip saved route correctly', () => {
    fc.assert(
      fc.property(savedRouteArb, (route) => {
        // Clear storage before each property test iteration
        localStorage.clear();
        
        // Skip invalid dates
        if (isNaN(route.savedAt.getTime())) {
          return true;
        }
        
        storageManager.saveRoute(route);
        const retrieved = storageManager.getSavedRoutes();
        
        expect(retrieved).toHaveLength(1);
        expect(retrieved[0].id).toBe(route.id);
        expect(retrieved[0].source).toBe(route.source);
        expect(retrieved[0].destination).toBe(route.destination);
        
        // Date comparison - allow for serialization differences
        expect(retrieved[0].savedAt.getTime()).toBe(new Date(route.savedAt).getTime());
      }),
      { numRuns: 100 }
    );
  });

  it('should round-trip multiple saved routes correctly', () => {
    fc.assert(
      fc.property(
        fc.array(savedRouteArb, { minLength: 1, maxLength: 10 }),
        (routes) => {
          // Clear storage before each property test iteration
          localStorage.clear();
          
          // Save all routes
          routes.forEach(route => storageManager.saveRoute(route));
          
          const retrieved = storageManager.getSavedRoutes();
          
          // Should have same number of routes (accounting for duplicates by source/destination)
          expect(retrieved.length).toBeGreaterThan(0);
          expect(retrieved.length).toBeLessThanOrEqual(routes.length);
          
          // Each retrieved route should match a saved route
          retrieved.forEach(retrievedRoute => {
            const matchingRoute = routes.find(
              r => r.source === retrievedRoute.source && r.destination === retrievedRoute.destination
            );
            expect(matchingRoute).toBeDefined();
            if (matchingRoute) {
              expect(retrievedRoute.source).toBe(matchingRoute.source);
              expect(retrievedRoute.destination).toBe(matchingRoute.destination);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should round-trip checklist state correctly', () => {
    fc.assert(
      fc.property(checklistStateArb, (state) => {
        // Clear storage before each property test iteration
        localStorage.clear();
        
        // Skip invalid dates
        if (isNaN(state.lastUpdated.getTime())) {
          return true;
        }
        
        storageManager.saveChecklistState(state);
        const retrieved = storageManager.getChecklistState();
        
        // Check items match
        expect(Object.keys(retrieved.items)).toEqual(Object.keys(state.items));
        Object.keys(state.items).forEach(key => {
          expect(retrieved.items[key]).toBe(state.items[key]);
        });
        
        // Date comparison - allow for serialization differences
        expect(retrieved.lastUpdated.getTime()).toBe(new Date(state.lastUpdated).getTime());
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty checklist state', () => {
    const emptyState: ChecklistState = {
      items: {},
      lastUpdated: new Date(),
    };
    
    storageManager.saveChecklistState(emptyState);
    const retrieved = storageManager.getChecklistState();
    
    expect(retrieved.items).toEqual({});
    expect(retrieved.lastUpdated).toBeInstanceOf(Date);
  });

  it('should update existing route when saving duplicate source/destination', () => {
    fc.assert(
      fc.property(
        savedRouteArb,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (route, newId) => {
          // Clear storage before each property test iteration
          localStorage.clear();
          
          // Save original route
          storageManager.saveRoute(route);
          
          // Save route with same source/destination but different ID
          const updatedRoute: SavedRoute = {
            ...route,
            id: newId,
            savedAt: new Date(),
          };
          storageManager.saveRoute(updatedRoute);
          
          const retrieved = storageManager.getSavedRoutes();
          
          // Should only have one route
          expect(retrieved).toHaveLength(1);
          // Should have the new ID
          expect(retrieved[0].id).toBe(newId);
          expect(retrieved[0].source).toBe(route.source);
          expect(retrieved[0].destination).toBe(route.destination);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null for non-existent cyclone ID', () => {
    const retrieved = storageManager.getLastCyclone();
    expect(retrieved).toBeNull();
  });

  it('should return null for non-existent language preference', () => {
    const retrieved = storageManager.getLanguagePreference();
    expect(retrieved).toBeNull();
  });

  it('should return empty array for non-existent saved routes', () => {
    const retrieved = storageManager.getSavedRoutes();
    expect(retrieved).toEqual([]);
  });

  it('should return default checklist state for non-existent state', () => {
    const retrieved = storageManager.getChecklistState();
    expect(retrieved.items).toEqual({});
    expect(retrieved.lastUpdated).toBeInstanceOf(Date);
  });

  it('should preserve data across multiple save/retrieve cycles', () => {
    fc.assert(
      fc.property(
        cycloneIdArb,
        languageArb,
        savedRouteArb,
        checklistStateArb,
        (cycloneId, language, route, checklistState) => {
          // Clear storage before each property test iteration
          localStorage.clear();
          
          // Skip invalid dates
          if (isNaN(checklistState.lastUpdated.getTime()) || isNaN(route.savedAt.getTime())) {
            return true;
          }
          
          // Save all data
          storageManager.saveLastCyclone(cycloneId);
          storageManager.saveLanguagePreference(language);
          storageManager.saveRoute(route);
          storageManager.saveChecklistState(checklistState);
          
          // Retrieve all data
          const retrievedCyclone = storageManager.getLastCyclone();
          const retrievedLanguage = storageManager.getLanguagePreference();
          const retrievedRoutes = storageManager.getSavedRoutes();
          const retrievedChecklist = storageManager.getChecklistState();
          
          // Verify all data
          expect(retrievedCyclone).toBe(cycloneId);
          expect(retrievedLanguage).toBe(language);
          expect(retrievedRoutes).toHaveLength(1);
          expect(retrievedRoutes[0].source).toBe(route.source);
          expect(Object.keys(retrievedChecklist.items)).toEqual(Object.keys(checklistState.items));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (str) => {
          if (str.trim().length === 0) return; // Skip empty strings
          
          storageManager.saveLastCyclone(str);
          const retrieved = storageManager.getLastCyclone();
          expect(retrieved).toBe(str);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle unicode characters in route data', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (source, destination) => {
          if (source.trim().length === 0 || destination.trim().length === 0) return;
          
          // Clear storage before each property test iteration
          localStorage.clear();
          
          const route: SavedRoute = {
            id: 'test-id',
            source,
            destination,
            savedAt: new Date(),
          };
          
          storageManager.saveRoute(route);
          const retrieved = storageManager.getSavedRoutes();
          
          expect(retrieved).toHaveLength(1);
          expect(retrieved[0].source).toBe(source);
          expect(retrieved[0].destination).toBe(destination);
        }
      ),
      { numRuns: 100 }
    );
  });
});
