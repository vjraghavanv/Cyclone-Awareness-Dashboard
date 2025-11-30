import type {
  CycloneData,
  DistrictRisk,
  Update,
  TravelRouteAnalysis,
  RiskSummary,
  DashboardData,
  HolidayPrediction,
} from '../../types';
import { ErrorType, DashboardError } from '../../types';
import { environment } from '../../config/environment';
import { mockDataGenerator } from '../../utils/mockDataGenerator';

// Retry configuration for exponential backoff
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 2000, // 2 seconds
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
};

// API endpoint configuration
interface APIConfig {
  baseUrl: string;
  timeout: number;
}

const DEFAULT_API_CONFIG: APIConfig = {
  baseUrl: 'http://localhost:3000/api', // Can be overridden in constructor
  timeout: 10000, // 10 seconds
};

/**
 * APIClient service for handling all REST API communication
 * Implements error handling, retry logic with exponential backoff, and request validation
 */
export class APIClient {
  private baseUrl: string;
  private timeout: number;
  private retryConfig: RetryConfig;

  constructor(config: Partial<APIConfig> = {}, retryConfig: Partial<RetryConfig> = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_API_CONFIG.baseUrl;
    this.timeout = config.timeout || DEFAULT_API_CONFIG.timeout;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Get current cyclone information
   */
  async getCurrentCyclone(): Promise<CycloneData> {
    if (environment.enableMockData) {
      return Promise.resolve(mockDataGenerator.generateCyclone());
    }
    return this.fetchWithRetry<CycloneData>('/cyclone/current');
  }

  /**
   * Get district rainfall data
   */
  async getDistrictRainfall(): Promise<DistrictRisk[]> {
    if (environment.enableMockData) {
      return Promise.resolve(mockDataGenerator.generateDistricts(15));
    }
    return this.fetchWithRetry<DistrictRisk[]>('/rainfall/districts');
  }

  /**
   * Get government alerts
   */
  async getGovernmentAlerts(): Promise<Update[]> {
    if (environment.enableMockData) {
      const updates = mockDataGenerator.generateUpdates(10);
      return Promise.resolve(updates.filter(u => u.type === 'govt-announcement'));
    }
    return this.fetchWithRetry<Update[]>('/alerts/govt');
  }

  /**
   * Get IMD bulletins
   */
  async getIMDBulletins(): Promise<Update[]> {
    if (environment.enableMockData) {
      const updates = mockDataGenerator.generateUpdates(10);
      return Promise.resolve(updates.filter(u => u.type === 'imd-bulletin' || u.type === 'rainfall-alert'));
    }
    return this.fetchWithRetry<Update[]>('/bulletins/imd');
  }

  /**
   * Analyze travel route impact
   */
  async analyzeTravelRoute(source: string, destination: string): Promise<TravelRouteAnalysis> {
    if (environment.enableMockData) {
      return Promise.resolve(mockDataGenerator.generateRouteAnalysis(source, destination));
    }
    const params = new URLSearchParams({ source, destination });
    return this.fetchWithRetry<TravelRouteAnalysis>(`/travel/impact?${params}`);
  }

  /**
   * Get risk summary
   */
  async getRiskSummary(): Promise<RiskSummary> {
    if (environment.enableMockData) {
      const districts = mockDataGenerator.generateDistricts(15);
      const highRiskDistricts = districts.filter(d => d.severityScore >= 7);
      return Promise.resolve({
        overallSeverity: Math.max(...districts.map(d => d.severityScore)),
        affectedDistricts: districts.length,
        highRiskDistricts: highRiskDistricts.map(d => d.districtName),
        activeAlerts: Math.floor(Math.random() * 5) + 3,
      });
    }
    return this.fetchWithRetry<RiskSummary>('/risk/summary');
  }

  /**
   * Get full dashboard data
   */
  async getFullDashboard(): Promise<DashboardData> {
    if (environment.enableMockData) {
      const cyclone = mockDataGenerator.generateCyclone();
      const districts = mockDataGenerator.generateDistricts(15);
      const updates = mockDataGenerator.generateUpdates(10);
      const holidayPrediction = mockDataGenerator.generateHolidayPrediction();
      const highRiskDistricts = districts.filter(d => d.severityScore >= 7);
      
      return Promise.resolve({
        cyclone,
        districts,
        holidayPrediction,
        updates,
        riskSummary: {
          overallSeverity: Math.max(...districts.map(d => d.severityScore)),
          affectedDistricts: districts.length,
          highRiskDistricts: highRiskDistricts.map(d => d.districtName),
          activeAlerts: updates.length,
        },
      });
    }
    return this.fetchWithRetry<DashboardData>('/dashboard/full');
  }

  /**
   * Get holiday prediction
   */
  async getHolidayPrediction(): Promise<HolidayPrediction> {
    if (environment.enableMockData) {
      return Promise.resolve(mockDataGenerator.generateHolidayPrediction());
    }
    return this.fetchWithRetry<HolidayPrediction>('/holiday/prediction');
  }

  /**
   * Perform health check on API endpoint
   */
  async healthCheck(endpoint: string): Promise<boolean> {
    try {
      const response = await this.fetch(`${endpoint}/health`, { method: 'GET' });
      return response.ok;
    } catch (error) {
      this.logError('healthCheck', error, endpoint);
      return false;
    }
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response = await this.fetch(endpoint, options);

      // Handle HTTP errors
      if (!response.ok) {
        return this.handleHTTPError<T>(response, endpoint, options, retryCount);
      }

      // Parse and validate response
      const data = await response.json();
      this.validateResponse(data, endpoint);

      return data as T;
    } catch (error) {
      return this.handleFetchError<T>(error, endpoint, options, retryCount);
    }
  }

  /**
   * Base fetch method with timeout
   */
  private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle HTTP errors (4xx, 5xx)
   */
  private async handleHTTPError<T>(
    response: Response,
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<T> {
    const statusCode = response.status;

    // Log error
    this.logError('HTTP Error', new Error(`HTTP ${statusCode}`), endpoint);

    // 5xx errors are retryable
    if (statusCode >= 500 && statusCode < 600 && retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateBackoffDelay(retryCount);
      await this.sleep(delay);
      return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
    }

    // 4xx errors are not retryable
    throw new DashboardError(
      ErrorType.API_ERROR,
      `API request failed with status ${statusCode}: ${endpoint}`,
      statusCode >= 500
    );
  }

  /**
   * Handle fetch errors (network failures, timeouts)
   */
  private async handleFetchError<T>(
    error: unknown,
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<T> {
    this.logError('Fetch Error', error, endpoint);

    // Network errors are retryable
    if (retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateBackoffDelay(retryCount);
      await this.sleep(delay);
      return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
    }

    // Max retries exceeded
    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new DashboardError(
      ErrorType.NETWORK_ERROR,
      `Network request failed after ${retryCount} retries: ${endpoint} - ${message}`,
      true
    );
  }

  /**
   * Validate API response structure
   */
  private validateResponse(data: unknown, endpoint: string): void {
    if (data === null || data === undefined) {
      throw new DashboardError(
        ErrorType.VALIDATION_ERROR,
        `Invalid response from ${endpoint}: data is null or undefined`,
        false
      );
    }

    // Additional validation can be added here based on endpoint
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(retryCount: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log errors to console
   */
  private logError(operation: string, error: unknown, context?: string): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      operation,
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.error(`APIClient.${operation}:`, errorDetails);
  }

  /**
   * Update base URL (useful for testing)
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
