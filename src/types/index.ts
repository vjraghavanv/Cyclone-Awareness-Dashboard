// Core type definitions for the Cyclone Awareness Dashboard

export type RiskLevel = 'low' | 'moderate' | 'high';

export type SeverityColor = 'yellow' | 'orange' | 'red';

export type CycloneCategory = 'depression' | 'cyclone' | 'severe-cyclone' | 'super-cyclone';

export type UpdateType = 'imd-bulletin' | 'rainfall-alert' | 'govt-announcement' | 'service-advisory';

export type HolidayProbability = 'low-risk' | 'possible' | 'likely';

export type TravelRecommendation = 'safe' | 'caution' | 'avoid-travel';

export type FreshnessLevel = 'fresh' | 'stale-yellow' | 'stale-orange' | 'stale-red';

export type Language = 'en' | 'ta';

export type ChecklistCategory = 'water' | 'power' | 'emergency' | 'supplies';

export type ChecklistPriority = 'essential' | 'recommended' | 'optional';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
  severity: RiskLevel;
}

export interface RouteSegment {
  districtId: string;
  districtName: string;
  riskLevel: RiskLevel;
}

export interface CycloneData {
  id: string;
  name: string;
  pathway: Coordinate[];
  currentPosition: Coordinate;
  windSpeed: number;
  pressure: number;
  category: CycloneCategory;
  lastUpdated: Date;
}

export interface DistrictRisk {
  districtId: string;
  districtName: string;
  rainfallEstimate: number; // in mm
  floodingProbability: RiskLevel;
  waterloggingRisk: RiskLevel;
  windImpact: RiskLevel;
  severityScore: number; // 0-10
  severityColor: SeverityColor;
  // Additional hazards (optional)
  stormSurge?: {
    risk: RiskLevel;
    waterLevelRise: number; // in meters
  };
  landslideRisk?: RiskLevel;
  isCoastal?: boolean;
  isHilly?: boolean;
}

export interface HolidayPrediction {
  date: Date;
  probability: HolidayProbability;
  confidence: number; // 0-100
  factors: {
    rainfallIntensity: number;
    windSpeed: number;
    alertLevel: string;
  };
}

export interface TravelRouteAnalysis {
  source: string;
  destination: string;
  affectedDistricts: string[];
  maxRainfall: number;
  disruptionWindows: TimeWindow[];
  recommendation: TravelRecommendation;
  riskSegments: RouteSegment[];
}

export interface Update {
  id: string;
  type: UpdateType;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
}

export interface RiskSummary {
  overallSeverity: number;
  affectedDistricts: number;
  highRiskDistricts: string[];
  activeAlerts: number;
}

export interface DashboardData {
  cyclone: CycloneData;
  districts: DistrictRisk[];
  holidayPrediction: HolidayPrediction;
  updates: Update[];
  riskSummary: RiskSummary;
}

export interface SavedRoute {
  id: string;
  source: string;
  destination: string;
  savedAt: Date;
}

export interface ChecklistState {
  items: Record<string, boolean>;
  lastUpdated: Date;
}

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  text: string;
  priority: ChecklistPriority;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // in milliseconds
}

export interface RiskFactor {
  type: 'rainfall' | 'wind' | 'flooding';
  value: number;
  weight: number;
}

export interface SeverityResult {
  score: number; // 0-10
  color: SeverityColor;
  level: RiskLevel;
}

export interface EnvironmentConfig {
  apiBaseUrl: string;
  zoomEarthEmbedUrl: string;
  windyEmbedUrl: string;
  enableMockData: boolean;
  cacheEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class DashboardError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;

  constructor(type: ErrorType, message: string, retryable: boolean = false) {
    super(message);
    this.name = 'DashboardError';
    this.type = type;
    this.retryable = retryable;
  }
}
