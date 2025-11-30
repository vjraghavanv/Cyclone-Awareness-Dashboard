import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateCycloneData,
  validateDistrictRisk,
  validateUpdate,
  validateHolidayPrediction,
  validateTravelRouteAnalysis,
  validateRiskSummary,
  validateDashboardData,
  isValidCoordinate,
} from '../../src/utils/validation';
import type {
  CycloneData,
  DistrictRisk,
  Update,
  HolidayPrediction,
  TravelRouteAnalysis,
  RiskSummary,
  DashboardData,
  Coordinate,
} from '../../src/types';

// **Feature: cyclone-awareness-dashboard, Property 13: API response validation**
// **Validates: Requirements 10.9**

describe('Property 13: API response validation', () => {
  // Arbitraries for generating valid test data
  const coordinateArb = fc.record({
    lat: fc.double({ min: -90, max: 90, noNaN: true }),
    lng: fc.double({ min: -180, max: 180, noNaN: true }),
  }) as fc.Arbitrary<Coordinate>;

  const cycloneCategoryArb = fc.constantFrom(
    'depression',
    'cyclone',
    'severe-cyclone',
    'super-cyclone'
  );

  const riskLevelArb = fc.constantFrom('low', 'moderate', 'high');

  const severityColorArb = fc.constantFrom('yellow', 'orange', 'red');

  const updateTypeArb = fc.constantFrom(
    'imd-bulletin',
    'rainfall-alert',
    'govt-announcement',
    'service-advisory'
  );

  const holidayProbabilityArb = fc.constantFrom('low-risk', 'possible', 'likely');

  const travelRecommendationArb = fc.constantFrom('safe', 'caution', 'avoid-travel');

  const cycloneDataArb = fc.record({
    id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    pathway: fc.array(coordinateArb, { minLength: 1 }),
    currentPosition: coordinateArb,
    windSpeed: fc.double({ min: 0, max: 300, noNaN: true }),
    pressure: fc.double({ min: 900, max: 1050, noNaN: true }),
    category: cycloneCategoryArb,
    lastUpdated: fc.date(),
  }) as fc.Arbitrary<CycloneData>;

  const districtRiskArb = fc.record({
    districtId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    districtName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    rainfallEstimate: fc.double({ min: 0, max: 1000, noNaN: true }),
    floodingProbability: riskLevelArb,
    waterloggingRisk: riskLevelArb,
    windImpact: riskLevelArb,
    severityScore: fc.double({ min: 0, max: 10, noNaN: true }),
    severityColor: severityColorArb,
  }) as fc.Arbitrary<DistrictRisk>;

  const updateArb = fc.record({
    id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    type: updateTypeArb,
    title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    content: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    source: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    timestamp: fc.date(),
  }) as fc.Arbitrary<Update>;

  const holidayPredictionArb = fc.record({
    date: fc.date(),
    probability: holidayProbabilityArb,
    confidence: fc.integer({ min: 0, max: 100 }),
    factors: fc.record({
      rainfallIntensity: fc.double({ min: 0, max: 500, noNaN: true }),
      windSpeed: fc.double({ min: 0, max: 300, noNaN: true }),
      alertLevel: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    }),
  }) as fc.Arbitrary<HolidayPrediction>;

  const travelRouteAnalysisArb = fc.record({
    source: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    destination: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    affectedDistricts: fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)),
    maxRainfall: fc.double({ min: 0, max: 1000, noNaN: true }),
    disruptionWindows: fc.array(
      fc.record({
        start: fc.date(),
        end: fc.date(),
        severity: riskLevelArb,
      })
    ),
    recommendation: travelRecommendationArb,
    riskSegments: fc.array(
      fc.record({
        districtId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        districtName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        riskLevel: riskLevelArb,
      })
    ),
  }) as fc.Arbitrary<TravelRouteAnalysis>;

  const riskSummaryArb = fc.record({
    overallSeverity: fc.double({ min: 0, max: 10, noNaN: true }),
    affectedDistricts: fc.integer({ min: 0, max: 100 }),
    highRiskDistricts: fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)),
    activeAlerts: fc.integer({ min: 0, max: 100 }),
  }) as fc.Arbitrary<RiskSummary>;

  const dashboardDataArb = fc.record({
    cyclone: cycloneDataArb,
    districts: fc.array(districtRiskArb, { minLength: 1 }),
    holidayPrediction: holidayPredictionArb,
    updates: fc.array(updateArb),
    riskSummary: riskSummaryArb,
  }) as fc.Arbitrary<DashboardData>;

  it('should validate valid coordinates', () => {
    fc.assert(
      fc.property(coordinateArb, (coord) => {
        expect(isValidCoordinate(coord)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid coordinates', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({ lat: fc.double({ min: -200, max: -91 }), lng: fc.double() }),
          fc.record({ lat: fc.double({ min: 91, max: 200 }), lng: fc.double() }),
          fc.record({ lat: fc.double(), lng: fc.double({ min: -300, max: -181 }) }),
          fc.record({ lat: fc.double(), lng: fc.double({ min: 181, max: 300 }) }),
          fc.constant(null),
          fc.constant(undefined),
          fc.string()
        ),
        (invalidCoord) => {
          expect(isValidCoordinate(invalidCoord)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate valid CycloneData', () => {
    fc.assert(
      fc.property(cycloneDataArb, (data) => {
        expect(validateCycloneData(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid DistrictRisk', () => {
    fc.assert(
      fc.property(districtRiskArb, (data) => {
        expect(validateDistrictRisk(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid Update', () => {
    fc.assert(
      fc.property(updateArb, (data) => {
        expect(validateUpdate(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid HolidayPrediction', () => {
    fc.assert(
      fc.property(holidayPredictionArb, (data) => {
        expect(validateHolidayPrediction(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid TravelRouteAnalysis', () => {
    fc.assert(
      fc.property(travelRouteAnalysisArb, (data) => {
        expect(validateTravelRouteAnalysis(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid RiskSummary', () => {
    fc.assert(
      fc.property(riskSummaryArb, (data) => {
        expect(validateRiskSummary(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate valid DashboardData', () => {
    fc.assert(
      fc.property(dashboardDataArb, (data) => {
        expect(validateDashboardData(data)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid CycloneData with missing fields', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({}),
          fc.constant(null),
          fc.record({ id: fc.string() }), // Missing other required fields
          fc.record({ id: fc.string(), name: fc.string(), windSpeed: fc.constant(-10) }) // Invalid windSpeed
        ),
        (invalidData) => {
          expect(validateCycloneData(invalidData)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject DistrictRisk with invalid severity score', () => {
    fc.assert(
      fc.property(
        districtRiskArb,
        fc.oneof(fc.constant(-1), fc.constant(11), fc.constant(100)),
        (validData, invalidScore) => {
          const invalidData = { ...validData, severityScore: invalidScore };
          expect(validateDistrictRisk(invalidData)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject Update with invalid type', () => {
    fc.assert(
      fc.property(updateArb, fc.string(), (validData, invalidType) => {
        // Only reject if the invalid type is not one of the valid types
        const validTypes = [
          'imd-bulletin',
          'rainfall-alert',
          'govt-announcement',
          'service-advisory',
        ];
        if (!validTypes.includes(invalidType)) {
          const invalidData = { ...validData, type: invalidType };
          expect(validateUpdate(invalidData)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should reject HolidayPrediction with confidence outside 0-100 range', () => {
    fc.assert(
      fc.property(
        holidayPredictionArb,
        fc.oneof(fc.constant(-1), fc.constant(101), fc.constant(200)),
        (validData, invalidConfidence) => {
          const invalidData = { ...validData, confidence: invalidConfidence };
          expect(validateHolidayPrediction(invalidData)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject TravelRouteAnalysis with invalid recommendation', () => {
    fc.assert(
      fc.property(travelRouteAnalysisArb, fc.string(), (validData, invalidRec) => {
        const validRecommendations = ['safe', 'caution', 'avoid-travel'];
        if (!validRecommendations.includes(invalidRec)) {
          const invalidData = { ...validData, recommendation: invalidRec };
          expect(validateTravelRouteAnalysis(invalidData)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});
