/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

export interface EnvironmentConfig {
  apiBaseUrl: string;
  enableMockData: boolean;
  zoomEarthEmbedUrl: string;
  windyEmbedUrl: string;
  cacheEnabled: boolean;
  cacheTTLMinutes: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableLiveEmbeds: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Environment configuration singleton
 */
export const environment: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
  enableMockData: getBooleanEnvVar('VITE_ENABLE_MOCK_DATA', true),

  // Map Embed URLs
  zoomEarthEmbedUrl: getEnvVar(
    'VITE_ZOOM_EARTH_EMBED_URL',
    'https://zoom.earth/#view=13.0827,80.2707,8z'
  ),
  windyEmbedUrl: getEnvVar(
    'VITE_WINDY_EMBED_URL',
    'https://embed.windy.com/embed2.html?lat=13.0827&lon=80.2707&zoom=8'
  ),

  // Cache Configuration
  cacheEnabled: getBooleanEnvVar('VITE_CACHE_ENABLED', true),
  cacheTTLMinutes: getNumberEnvVar('VITE_CACHE_TTL_MINUTES', 5),

  // Logging
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as EnvironmentConfig['logLevel']),

  // Feature Flags
  enableLiveEmbeds: getBooleanEnvVar('VITE_ENABLE_LIVE_EMBEDS', false),

  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Log environment configuration (development only)
 */
if (environment.isDevelopment && environment.logLevel === 'debug') {
  console.log('Environment Configuration:', environment);
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const required = ['apiBaseUrl'];
  const missing = required.filter((key) => !environment[key as keyof EnvironmentConfig]);

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
}

// Validate on module load
validateEnvironment();
