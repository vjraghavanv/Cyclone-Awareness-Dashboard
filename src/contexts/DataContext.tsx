import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type {
  CycloneData,
  DistrictRisk,
  Update,
  HolidayPrediction,
  RiskSummary,
} from '../types';
import { apiClient } from '../services/api';
import { cacheManager, CACHE_CONFIG } from '../services/cache';
import { rateLimiter } from '../services/ratelimit';
import { environment } from '../config/environment';

interface DataContextType {
  // Data state
  cyclone: CycloneData | null;
  districts: DistrictRisk[];
  updates: Update[];
  holidayPrediction: HolidayPrediction | null;
  riskSummary: RiskSummary | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Health check state
  healthStatus: Record<string, boolean>;
  
  // Actions
  refreshData: () => Promise<void>;
  checkHealth: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const ENDPOINTS = {
  CYCLONE: 'cyclone',
  DISTRICTS: 'districts',
  UPDATES: 'updates',
  HOLIDAY: 'holiday',
  RISK_SUMMARY: 'risk_summary',
} as const;

/**
 * DataProvider component
 * Manages all data fetching, caching, and rate limiting
 * Integrates APIClient, CacheManager, and RateLimiter
 */
export function DataProvider({ 
  children, 
  autoRefresh = true, 
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: DataProviderProps) {
  // Data state
  const [cyclone, setCyclone] = useState<CycloneData | null>(null);
  const [districts, setDistricts] = useState<DistrictRisk[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [holidayPrediction, setHolidayPrediction] = useState<HolidayPrediction | null>(null);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Health check state
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});

  /**
   * Fetch data with caching and rate limiting
   */
  const fetchWithCacheAndRateLimit = useCallback(async <T,>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T | null> => {
    try {
      // Check cache first
      const cached = cacheManager.get<T>(endpoint);
      if (cached && cacheManager.isValid(endpoint)) {
        return cached.data;
      }

      // Check rate limit
      if (!rateLimiter.canMakeRequest(endpoint)) {
        console.warn(`Rate limit exceeded for ${endpoint}, serving cached data`);
        return cached?.data || null;
      }

      // Fetch fresh data
      const data = await fetchFn();
      
      // Record request and cache data
      rateLimiter.recordRequest(endpoint);
      cacheManager.set(endpoint, data, ttl);
      
      return data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      
      // Try to serve stale cache on error
      const cached = cacheManager.get<T>(endpoint);
      if (cached) {
        console.warn(`Serving stale cache for ${endpoint}`);
        return cached.data;
      }
      
      throw err;
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        cycloneData,
        districtsData,
        updatesData,
        holidayData,
        riskData,
      ] = await Promise.allSettled([
        fetchWithCacheAndRateLimit(
          ENDPOINTS.CYCLONE,
          () => apiClient.getCurrentCyclone(),
          CACHE_CONFIG.cycloneData
        ),
        fetchWithCacheAndRateLimit(
          ENDPOINTS.DISTRICTS,
          () => apiClient.getDistrictRainfall(),
          CACHE_CONFIG.districtRainfall
        ),
        fetchWithCacheAndRateLimit(
          ENDPOINTS.UPDATES,
          async () => {
            const [govtAlerts, imdBulletins] = await Promise.all([
              apiClient.getGovernmentAlerts(),
              apiClient.getIMDBulletins(),
            ]);
            return [...govtAlerts, ...imdBulletins];
          },
          CACHE_CONFIG.updates
        ),
        fetchWithCacheAndRateLimit(
          ENDPOINTS.HOLIDAY,
          () => apiClient.getHolidayPrediction(),
          CACHE_CONFIG.cycloneData
        ),
        fetchWithCacheAndRateLimit(
          ENDPOINTS.RISK_SUMMARY,
          () => apiClient.getRiskSummary(),
          CACHE_CONFIG.cycloneData
        ),
      ]);

      // Update state with fetched data
      if (cycloneData.status === 'fulfilled' && cycloneData.value) {
        setCyclone(cycloneData.value);
      }
      
      if (districtsData.status === 'fulfilled' && districtsData.value) {
        setDistricts(districtsData.value);
      }
      
      if (updatesData.status === 'fulfilled' && updatesData.value) {
        setUpdates(updatesData.value);
      }
      
      if (holidayData.status === 'fulfilled' && holidayData.value) {
        setHolidayPrediction(holidayData.value);
      }
      
      if (riskData.status === 'fulfilled' && riskData.value) {
        setRiskSummary(riskData.value);
      }

      // Check if any requests failed
      const failures = [cycloneData, districtsData, updatesData, holidayData, riskData]
        .filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn(`${failures.length} data fetch(es) failed, using cached data where available`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithCacheAndRateLimit]);

  /**
   * Perform health check on all API endpoints
   */
  const checkHealth = useCallback(async () => {
    try {
      const endpoints = [
        '/cyclone/current',
        '/rainfall/districts',
        '/alerts/govt',
        '/bulletins/imd',
        '/holiday/prediction',
        '/risk/summary',
      ];

      // Skip health checks if using mock data (development mode)
      if (environment.enableMockData) {
        const mockStatus: Record<string, boolean> = {};
        endpoints.forEach(endpoint => {
          mockStatus[endpoint] = true;
        });
        setHealthStatus(mockStatus);
        return;
      }

      const healthChecks = await Promise.allSettled(
        endpoints.map(async (endpoint) => ({
          endpoint,
          healthy: await apiClient.healthCheck(endpoint),
        }))
      );

      const status: Record<string, boolean> = {};
      healthChecks.forEach((result) => {
        if (result.status === 'fulfilled') {
          status[result.value.endpoint] = result.value.healthy;
        } else {
          status['unknown'] = false;
        }
      });

      setHealthStatus(status);
    } catch (err) {
      console.error('Error checking health:', err);
      // Set all endpoints as unhealthy on error
      const endpoints = [
        '/cyclone/current',
        '/rainfall/districts',
        '/alerts/govt',
        '/bulletins/imd',
        '/holiday/prediction',
        '/risk/summary',
      ];
      const status: Record<string, boolean> = {};
      endpoints.forEach(endpoint => {
        status[endpoint] = false;
      });
      setHealthStatus(status);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
    checkHealth();
  }, [refreshData, checkHealth]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, refreshData]);

  const value: DataContextType = {
    cyclone,
    districts,
    updates,
    holidayPrediction,
    riskSummary,
    loading,
    error,
    healthStatus,
    refreshData,
    checkHealth,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/**
 * useData hook
 * Provides access to data state and actions
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}
