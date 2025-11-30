import type {
  RiskLevel,
  SeverityColor,
  SeverityResult,
  RiskFactor,
} from '../../types';

/**
 * Severity Scoring Algorithm
 * Score = (rainfall_normalized * 0.4) + (wind_normalized * 0.3) + (flooding_risk * 0.3)
 * Normalization: rainfall (0-500mm -> 0-10), wind (0-200kmh -> 0-10)
 * Color mapping: 0-3.9 = yellow, 4-6.9 = orange, 7-10 = red
 */

// Configuration constants
const RAINFALL_MAX = 500; // mm
const WIND_SPEED_MAX = 200; // km/h
const SCORE_MAX = 10;

const WEIGHTS = {
  rainfall: 0.4,
  wind: 0.3,
  flooding: 0.3,
} as const;

const RISK_LEVEL_SCORES: Record<RiskLevel, number> = {
  low: 2,
  moderate: 5,
  high: 9,
};

const SEVERITY_THRESHOLDS = {
  yellow: { min: 0, max: 3.9 },
  orange: { min: 4, max: 6.9 },
  red: { min: 7, max: 10 },
} as const;

/**
 * Normalizes rainfall value to 0-10 scale
 */
function normalizeRainfall(rainfall: number): number {
  if (rainfall < 0) return 0;
  if (rainfall > RAINFALL_MAX) return SCORE_MAX;
  return (rainfall / RAINFALL_MAX) * SCORE_MAX;
}

/**
 * Normalizes wind speed value to 0-10 scale
 */
function normalizeWindSpeed(windSpeed: number): number {
  if (windSpeed < 0) return 0;
  if (windSpeed > WIND_SPEED_MAX) return SCORE_MAX;
  return (windSpeed / WIND_SPEED_MAX) * SCORE_MAX;
}

/**
 * Converts risk level to numeric score
 */
function riskLevelToScore(riskLevel: RiskLevel): number {
  return RISK_LEVEL_SCORES[riskLevel];
}

/**
 * Determines severity color based on score
 */
export function getSeverityColor(score: number): SeverityColor {
  if (score < 0) return 'yellow';
  if (score > SCORE_MAX) return 'red';

  if (score <= SEVERITY_THRESHOLDS.yellow.max) return 'yellow';
  if (score <= SEVERITY_THRESHOLDS.orange.max) return 'orange';
  return 'red';
}

/**
 * Converts severity score to risk level
 */
function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= SEVERITY_THRESHOLDS.yellow.max) return 'low';
  if (score <= SEVERITY_THRESHOLDS.orange.max) return 'moderate';
  return 'high';
}

/**
 * Calculates district severity based on rainfall, wind speed, and flooding risk
 */
export function calculateDistrictSeverity(
  rainfall: number,
  windSpeed: number,
  floodingRisk: RiskLevel
): SeverityResult {
  // Normalize inputs
  const rainfallNormalized = normalizeRainfall(rainfall);
  const windNormalized = normalizeWindSpeed(windSpeed);
  const floodingScore = riskLevelToScore(floodingRisk);

  // Calculate weighted score
  const score =
    rainfallNormalized * WEIGHTS.rainfall +
    windNormalized * WEIGHTS.wind +
    floodingScore * WEIGHTS.flooding;

  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(SCORE_MAX, score));

  // Round to 1 decimal place
  const roundedScore = Math.round(clampedScore * 10) / 10;

  return {
    score: roundedScore,
    color: getSeverityColor(roundedScore),
    level: scoreToRiskLevel(roundedScore),
  };
}

/**
 * Combines multiple risk factors into a single severity score
 */
export function combineRiskFactors(factors: RiskFactor[]): number {
  if (factors.length === 0) return 0;

  // Calculate total weight
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);

  if (totalWeight === 0) return 0;

  // Calculate weighted average
  const weightedSum = factors.reduce((sum, factor) => {
    return sum + factor.value * factor.weight;
  }, 0);

  const score = weightedSum / totalWeight;

  // Clamp and round
  const clampedScore = Math.max(0, Math.min(SCORE_MAX, score));
  return Math.round(clampedScore * 10) / 10;
}

/**
 * SeverityCalculator class for managing severity calculations
 */
export class SeverityCalculator {
  /**
   * Calculates district severity
   */
  calculateDistrictSeverity(
    rainfall: number,
    windSpeed: number,
    floodingRisk: RiskLevel
  ): SeverityResult {
    return calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
  }

  /**
   * Combines risk factors
   */
  combineRiskFactors(factors: RiskFactor[]): number {
    return combineRiskFactors(factors);
  }

  /**
   * Gets severity color for a score
   */
  getSeverityColor(score: number): SeverityColor {
    return getSeverityColor(score);
  }

  /**
   * Normalizes rainfall to 0-10 scale
   */
  normalizeRainfall(rainfall: number): number {
    return normalizeRainfall(rainfall);
  }

  /**
   * Normalizes wind speed to 0-10 scale
   */
  normalizeWindSpeed(windSpeed: number): number {
    return normalizeWindSpeed(windSpeed);
  }

  /**
   * Converts risk level to numeric score
   */
  riskLevelToScore(riskLevel: RiskLevel): number {
    return riskLevelToScore(riskLevel);
  }
}

// Export singleton instance
export const severityCalculator = new SeverityCalculator();
