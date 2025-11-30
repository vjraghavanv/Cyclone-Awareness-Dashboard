import type {
  CycloneData,
  DistrictRisk,
  Update,
  HolidayPrediction,
  TravelRouteAnalysis,
  RiskSummary,
  DashboardData,
} from '../types';

/**
 * Validates if a value is a valid coordinate
 */
export function isValidCoordinate(coord: unknown): boolean {
  if (typeof coord !== 'object' || coord === null) return false;
  const c = coord as Record<string, unknown>;
  return (
    typeof c.lat === 'number' &&
    typeof c.lng === 'number' &&
    c.lat >= -90 &&
    c.lat <= 90 &&
    c.lng >= -180 &&
    c.lng <= 180
  );
}

/**
 * Validates CycloneData structure
 */
export function validateCycloneData(data: unknown): data is CycloneData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.id === 'string' &&
    d.id.trim().length > 0 &&
    typeof d.name === 'string' &&
    d.name.trim().length > 0 &&
    Array.isArray(d.pathway) &&
    d.pathway.length > 0 &&
    d.pathway.every(isValidCoordinate) &&
    isValidCoordinate(d.currentPosition) &&
    typeof d.windSpeed === 'number' &&
    !isNaN(d.windSpeed) &&
    d.windSpeed >= 0 &&
    typeof d.pressure === 'number' &&
    !isNaN(d.pressure) &&
    d.pressure >= 0 &&
    typeof d.category === 'string' &&
    ['depression', 'cyclone', 'severe-cyclone', 'super-cyclone'].includes(
      d.category as string
    ) &&
    (d.lastUpdated instanceof Date || typeof d.lastUpdated === 'string')
  );
}

/**
 * Validates DistrictRisk structure
 */
export function validateDistrictRisk(data: unknown): data is DistrictRisk {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  const validRiskLevels = ['low', 'moderate', 'high'];
  const validSeverityColors = ['yellow', 'orange', 'red'];

  return (
    typeof d.districtId === 'string' &&
    d.districtId.trim().length > 0 &&
    typeof d.districtName === 'string' &&
    d.districtName.trim().length > 0 &&
    typeof d.rainfallEstimate === 'number' &&
    !isNaN(d.rainfallEstimate) &&
    d.rainfallEstimate >= 0 &&
    validRiskLevels.includes(d.floodingProbability as string) &&
    validRiskLevels.includes(d.waterloggingRisk as string) &&
    validRiskLevels.includes(d.windImpact as string) &&
    typeof d.severityScore === 'number' &&
    !isNaN(d.severityScore) &&
    d.severityScore >= 0 &&
    d.severityScore <= 10 &&
    validSeverityColors.includes(d.severityColor as string)
  );
}

/**
 * Validates Update structure
 */
export function validateUpdate(data: unknown): data is Update {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  const validUpdateTypes = [
    'imd-bulletin',
    'rainfall-alert',
    'govt-announcement',
    'service-advisory',
  ];

  return (
    typeof d.id === 'string' &&
    validUpdateTypes.includes(d.type as string) &&
    typeof d.title === 'string' &&
    typeof d.content === 'string' &&
    typeof d.source === 'string' &&
    (d.timestamp instanceof Date || typeof d.timestamp === 'string')
  );
}

/**
 * Validates HolidayPrediction structure
 */
export function validateHolidayPrediction(
  data: unknown
): data is HolidayPrediction {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  const validProbabilities = ['low-risk', 'possible', 'likely'];

  return (
    (d.date instanceof Date || typeof d.date === 'string') &&
    validProbabilities.includes(d.probability as string) &&
    typeof d.confidence === 'number' &&
    d.confidence >= 0 &&
    d.confidence <= 100 &&
    typeof d.factors === 'object' &&
    d.factors !== null
  );
}

/**
 * Validates TravelRouteAnalysis structure
 */
export function validateTravelRouteAnalysis(
  data: unknown
): data is TravelRouteAnalysis {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  const validRecommendations = ['safe', 'caution', 'avoid-travel'];

  return (
    typeof d.source === 'string' &&
    typeof d.destination === 'string' &&
    Array.isArray(d.affectedDistricts) &&
    d.affectedDistricts.every((id) => typeof id === 'string') &&
    typeof d.maxRainfall === 'number' &&
    d.maxRainfall >= 0 &&
    Array.isArray(d.disruptionWindows) &&
    validRecommendations.includes(d.recommendation as string) &&
    Array.isArray(d.riskSegments)
  );
}

/**
 * Validates RiskSummary structure
 */
export function validateRiskSummary(data: unknown): data is RiskSummary {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.overallSeverity === 'number' &&
    !isNaN(d.overallSeverity) &&
    d.overallSeverity >= 0 &&
    d.overallSeverity <= 10 &&
    typeof d.affectedDistricts === 'number' &&
    !isNaN(d.affectedDistricts) &&
    d.affectedDistricts >= 0 &&
    Array.isArray(d.highRiskDistricts) &&
    d.highRiskDistricts.every((id) => typeof id === 'string') &&
    typeof d.activeAlerts === 'number' &&
    !isNaN(d.activeAlerts) &&
    d.activeAlerts >= 0
  );
}

/**
 * Validates complete DashboardData structure
 */
export function validateDashboardData(data: unknown): data is DashboardData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    validateCycloneData(d.cyclone) &&
    Array.isArray(d.districts) &&
    d.districts.every(validateDistrictRisk) &&
    validateHolidayPrediction(d.holidayPrediction) &&
    Array.isArray(d.updates) &&
    d.updates.every(validateUpdate) &&
    validateRiskSummary(d.riskSummary)
  );
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates location name input
 */
export function validateLocationName(name: string): boolean {
  const sanitized = sanitizeInput(name);
  return sanitized.length > 0 && sanitized.length <= 100;
}
