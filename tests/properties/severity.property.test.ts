import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateDistrictSeverity,
  getSeverityColor,
  combineRiskFactors,
} from '../../src/services/severity/calculator';
import type { RiskLevel, RiskFactor } from '../../src/types';

// **Feature: cyclone-awareness-dashboard, Property 1: Severity color classification consistency**
// **Validates: Requirements 1.3, 12.2**

describe('Property 1: Severity color classification consistency', () => {
  const riskLevelArb = fc.constantFrom<RiskLevel>('low', 'moderate', 'high');

  it('should map severity scores to correct colors: 0-3.9=yellow, 4-6.9=orange, 7-10=red', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10, noNaN: true }),
        (score) => {
          const color = getSeverityColor(score);

          if (score <= 3.9) {
            expect(color).toBe('yellow');
          } else if (score <= 6.9) {
            expect(color).toBe('orange');
          } else {
            expect(color).toBe('red');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases at boundaries', () => {
    expect(getSeverityColor(0)).toBe('yellow');
    expect(getSeverityColor(3.9)).toBe('yellow');
    expect(getSeverityColor(4.0)).toBe('orange');
    expect(getSeverityColor(6.9)).toBe('orange');
    expect(getSeverityColor(7.0)).toBe('red');
    expect(getSeverityColor(10)).toBe('red');
  });

  it('should handle out-of-range scores gracefully', () => {
    expect(getSeverityColor(-1)).toBe('yellow');
    expect(getSeverityColor(11)).toBe('red');
    expect(getSeverityColor(100)).toBe('red');
  });

  it('should produce consistent colors for calculated severity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);

          // Verify color matches score range
          if (result.score <= 3.9) {
            expect(result.color).toBe('yellow');
          } else if (result.score <= 6.9) {
            expect(result.color).toBe('orange');
          } else {
            expect(result.color).toBe('red');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure score is always between 0 and 10', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce valid color values', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          expect(['yellow', 'orange', 'red']).toContain(result.color);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce valid risk level values', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          expect(['low', 'moderate', 'high']).toContain(result.level);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: cyclone-awareness-dashboard, Property 15: Severity score calculation consistency**
// **Validates: Requirements 12.1, 12.3**

describe('Property 15: Severity score calculation consistency', () => {
  const riskLevelArb = fc.constantFrom<RiskLevel>('low', 'moderate', 'high');

  it('should use unified algorithm: (rainfall*0.4) + (wind*0.3) + (flooding*0.3)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);

          // Manually calculate expected score
          const rainfallNormalized = Math.min((rainfall / 500) * 10, 10);
          const windNormalized = Math.min((windSpeed / 200) * 10, 10);

          const floodingScores = { low: 2, moderate: 5, high: 9 };
          const floodingScore = floodingScores[floodingRisk];

          const expectedScore =
            rainfallNormalized * 0.4 + windNormalized * 0.3 + floodingScore * 0.3;

          const clampedExpected = Math.max(0, Math.min(10, expectedScore));
          const roundedExpected = Math.round(clampedExpected * 10) / 10;

          expect(result.score).toBe(roundedExpected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce scores between 0 and 10', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000, noNaN: true }),
        fc.double({ min: 0, max: 1000, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero values correctly', () => {
    const result = calculateDistrictSeverity(0, 0, 'low');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('should handle maximum values correctly', () => {
    const result = calculateDistrictSeverity(500, 200, 'high');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('should be deterministic - same inputs produce same outputs', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result1 = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          const result2 = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);

          expect(result1.score).toBe(result2.score);
          expect(result1.color).toBe(result2.color);
          expect(result1.level).toBe(result2.level);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should increase score when rainfall increases', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 400, noNaN: true }),
        fc.double({ min: 0, max: 200, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result1 = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          const result2 = calculateDistrictSeverity(
            rainfall + 100,
            windSpeed,
            floodingRisk
          );

          expect(result2.score).toBeGreaterThanOrEqual(result1.score);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should increase score when wind speed increases', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        riskLevelArb,
        (rainfall, windSpeed, floodingRisk) => {
          const result1 = calculateDistrictSeverity(rainfall, windSpeed, floodingRisk);
          const result2 = calculateDistrictSeverity(
            rainfall,
            windSpeed + 50,
            floodingRisk
          );

          expect(result2.score).toBeGreaterThanOrEqual(result1.score);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should combine risk factors correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            type: fc.constantFrom<'rainfall' | 'wind' | 'flooding'>(
              'rainfall',
              'wind',
              'flooding'
            ),
            value: fc.double({ min: 0, max: 10, noNaN: true }),
            weight: fc.double({ min: 0.1, max: 1, noNaN: true }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (factors: RiskFactor[]) => {
          const score = combineRiskFactors(factors);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 for empty risk factors', () => {
    const score = combineRiskFactors([]);
    expect(score).toBe(0);
  });

  it('should handle single risk factor', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10, noNaN: true }),
        (value) => {
          const score = combineRiskFactors([
            { type: 'rainfall', value, weight: 1 },
          ]);
          expect(score).toBe(Math.round(value * 10) / 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
