import type {
  CycloneData,
  DistrictRisk,
  Update,
  HolidayPrediction,
  TravelRouteAnalysis,
  RiskSummary,
  CycloneCategory,
  RiskLevel,
  SeverityColor,
  UpdateType,
  HolidayProbability,
  TravelRecommendation,
} from '../types';

/**
 * Mock Data Generator for Development
 * Generates realistic cyclone data with various severity levels and scenarios
 */

// Tamil Nadu districts
const DISTRICTS = [
  { id: 'chennai', name: 'Chennai', nameLocal: 'சென்னை', isCoastal: true },
  { id: 'kanchipuram', name: 'Kanchipuram', nameLocal: 'காஞ்சிபுரம்', isCoastal: true },
  { id: 'tiruvallur', name: 'Tiruvallur', nameLocal: 'திருவள்ளூர்', isCoastal: true },
  { id: 'chengalpattu', name: 'Chengalpattu', nameLocal: 'செங்கல்பட்டு', isCoastal: true },
  { id: 'cuddalore', name: 'Cuddalore', nameLocal: 'கடலூர்', isCoastal: true },
  { id: 'villupuram', name: 'Villupuram', nameLocal: 'விழுப்புரம்', isCoastal: false },
  { id: 'vellore', name: 'Vellore', nameLocal: 'வேலூர்', isCoastal: false },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', nameLocal: 'திருவண்ணாமலை', isCoastal: false, isHilly: true },
  { id: 'salem', name: 'Salem', nameLocal: 'சேலம்', isCoastal: false, isHilly: true },
  { id: 'dharmapuri', name: 'Dharmapuri', nameLocal: 'தர்மபுரி', isCoastal: false, isHilly: true },
];

// Cyclone names
const CYCLONE_NAMES = ['Michaung', 'Mandous', 'Nivar', 'Burevi', 'Gaja', 'Vardah', 'Nada', 'Thane'];

/**
 * Generate random number within range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Pick random item from array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random coordinates near Chennai
 */
function generateCoordinates(baseLatitude = 13.0827, baseLongitude = 80.2707, radius = 2): { lat: number; lng: number } {
  return {
    lat: baseLatitude + (Math.random() - 0.5) * radius,
    lng: baseLongitude + (Math.random() - 0.5) * radius,
  };
}

/**
 * Generate cyclone category based on wind speed
 */
function getCycloneCategory(windSpeed: number): CycloneCategory {
  if (windSpeed < 62) return 'depression';
  if (windSpeed < 88) return 'cyclone';
  if (windSpeed < 118) return 'severe-cyclone';
  return 'super-cyclone';
}

/**
 * Generate severity color based on score
 */
function getSeverityColor(score: number): SeverityColor {
  if (score < 4) return 'yellow';
  if (score < 7) return 'orange';
  return 'red';
}

/**
 * Generate risk level based on value
 */
function getRiskLevel(value: number): RiskLevel {
  if (value < 0.33) return 'low';
  if (value < 0.67) return 'moderate';
  return 'high';
}

/**
 * Generate mock cyclone data
 */
export function generateCyclone(severity: 'low' | 'moderate' | 'high' | 'extreme' = 'moderate'): CycloneData {
  const windSpeedRanges = {
    low: [40, 62],
    moderate: [62, 88],
    high: [88, 118],
    extreme: [118, 150],
  };

  const [minWind, maxWind] = windSpeedRanges[severity];
  const windSpeed = randomInRange(minWind, maxWind);
  const pressure = 1010 - (windSpeed / 150) * 100; // Inverse relationship

  // Generate pathway (5-10 points)
  const pathwayLength = Math.floor(randomInRange(5, 10));
  const pathway = Array.from({ length: pathwayLength }, (_, i) => {
    return generateCoordinates(13.0827 + i * 0.5, 80.2707 - i * 0.3, 0.5);
  });

  return {
    id: `CYC-${Date.now()}`,
    name: randomItem(CYCLONE_NAMES),
    pathway,
    currentPosition: pathway[Math.floor(pathway.length / 2)],
    windSpeed: Math.round(windSpeed),
    pressure: Math.round(pressure),
    category: getCycloneCategory(windSpeed),
    lastUpdated: new Date(),
  };
}

/**
 * Generate mock district risk data
 */
export function generateDistricts(count: number = 10, severityVariation: boolean = true): DistrictRisk[] {
  return DISTRICTS.slice(0, count).map((district) => {
    const baseSeverity = severityVariation ? Math.random() : 0.5;
    const rainfallEstimate = Math.round(randomInRange(50, 300) * (0.5 + baseSeverity));
    const severityScore = Math.round((baseSeverity * 10) * 10) / 10;

    const districtRisk: DistrictRisk = {
      districtId: district.id,
      districtName: district.name,
      rainfallEstimate,
      floodingProbability: getRiskLevel(baseSeverity),
      waterloggingRisk: getRiskLevel(baseSeverity + Math.random() * 0.2),
      windImpact: getRiskLevel(baseSeverity - Math.random() * 0.1),
      severityScore,
      severityColor: getSeverityColor(severityScore),
      isCoastal: district.isCoastal,
      isHilly: district.isHilly,
    };

    // Add storm surge for coastal districts
    if (district.isCoastal && baseSeverity > 0.4) {
      districtRisk.stormSurge = {
        risk: getRiskLevel(baseSeverity),
        waterLevelRise: Math.round(randomInRange(0.5, 3) * 10) / 10,
      };
    }

    // Add landslide risk for hilly districts
    if (district.isHilly && baseSeverity > 0.3) {
      districtRisk.landslideRisk = getRiskLevel(baseSeverity * 0.8);
    }

    return districtRisk;
  });
}

/**
 * Generate mock updates
 */
export function generateUpdates(count: number = 10): Update[] {
  const updateTypes: UpdateType[] = ['imd-bulletin', 'rainfall-alert', 'govt-announcement', 'service-advisory'];
  
  const templates = {
    'imd-bulletin': [
      'Cyclone {name} intensified into a severe cyclonic storm',
      'Depression over Bay of Bengal likely to intensify',
      'Cyclone {name} to cross coast between {location1} and {location2}',
    ],
    'rainfall-alert': [
      'Heavy to very heavy rainfall expected in coastal districts',
      'Red alert issued for {district} district',
      'Extremely heavy rainfall warning for next 24 hours',
    ],
    'govt-announcement': [
      'Schools and colleges closed in {district} district',
      'NDRF teams deployed in vulnerable areas',
      'Emergency helpline numbers activated',
    ],
    'service-advisory': [
      'Power supply may be affected in coastal areas',
      'Public transport services suspended',
      'Fishing activities banned along the coast',
    ],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = randomItem(updateTypes);
    const template = randomItem(templates[type]);
    const title = template
      .replace('{name}', randomItem(CYCLONE_NAMES))
      .replace('{district}', randomItem(DISTRICTS).name)
      .replace('{location1}', randomItem(DISTRICTS).name)
      .replace('{location2}', randomItem(DISTRICTS).name);

    return {
      id: `UPD-${Date.now()}-${i}`,
      type,
      title,
      content: `${title}. Residents are advised to stay indoors and follow safety guidelines. For more information, contact local authorities.`,
      source: type === 'imd-bulletin' ? 'India Meteorological Department' : 'Tamil Nadu Government',
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 24), // Random time in last 24 hours
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate mock holiday prediction
 */
export function generateHolidayPrediction(severity: 'low' | 'moderate' | 'high' = 'moderate'): HolidayPrediction {
  const probabilityMap: Record<string, HolidayProbability> = {
    low: 'low-risk',
    moderate: 'possible',
    high: 'likely',
  };

  const confidenceMap = {
    low: randomInRange(20, 40),
    moderate: randomInRange(50, 70),
    high: randomInRange(75, 95),
  };

  const rainfallMap = {
    low: randomInRange(50, 100),
    moderate: randomInRange(100, 200),
    high: randomInRange(200, 350),
  };

  const windSpeedMap = {
    low: randomInRange(40, 60),
    moderate: randomInRange(60, 90),
    high: randomInRange(90, 130),
  };

  return {
    date: new Date(Date.now() + 86400000), // Tomorrow
    probability: probabilityMap[severity],
    confidence: Math.round(confidenceMap[severity]),
    factors: {
      rainfallIntensity: Math.round(rainfallMap[severity]),
      windSpeed: Math.round(windSpeedMap[severity]),
      alertLevel: severity === 'high' ? 'Red Alert' : severity === 'moderate' ? 'Orange Alert' : 'Yellow Alert',
    },
  };
}

/**
 * Generate mock travel route analysis
 */
export function generateRouteAnalysis(source: string, destination: string): TravelRouteAnalysis {
  const affectedCount = Math.floor(randomInRange(2, 5));
  const affectedDistricts = DISTRICTS.slice(0, affectedCount).map((d) => d.id);
  const maxRainfall = Math.round(randomInRange(100, 300));
  
  const severityFactor = maxRainfall / 300;
  const recommendation: TravelRecommendation = 
    severityFactor > 0.7 ? 'avoid-travel' : 
    severityFactor > 0.4 ? 'caution' : 'safe';

  return {
    source,
    destination,
    affectedDistricts,
    maxRainfall,
    disruptionWindows: [
      {
        start: new Date(Date.now() + 3600000 * 2),
        end: new Date(Date.now() + 3600000 * 8),
        severity: getRiskLevel(severityFactor),
      },
    ],
    recommendation,
    riskSegments: affectedDistricts.map((id) => {
      const district = DISTRICTS.find((d) => d.id === id)!;
      return {
        districtId: id,
        districtName: district.name,
        riskLevel: getRiskLevel(Math.random()),
      };
    }),
  };
}

/**
 * Generate mock risk summary
 */
export function generateRiskSummary(districts: DistrictRisk[]): RiskSummary {
  const highRiskDistricts = districts.filter((d) => d.severityScore >= 7);
  const overallSeverity = districts.reduce((sum, d) => sum + d.severityScore, 0) / districts.length;

  return {
    overallSeverity: Math.round(overallSeverity * 10) / 10,
    affectedDistricts: districts.length,
    highRiskDistricts: highRiskDistricts.map((d) => d.districtName),
    activeAlerts: Math.floor(randomInRange(3, 10)),
  };
}

/**
 * Generate complete mock dashboard data
 */
export function generateMockDashboardData(severity: 'low' | 'moderate' | 'high' | 'extreme' = 'moderate') {
  const cyclone = generateCyclone(severity);
  const districts = generateDistricts(10, true);
  const updates = generateUpdates(15);
  const holidayPrediction = generateHolidayPrediction(severity === 'extreme' ? 'high' : severity);
  const riskSummary = generateRiskSummary(districts);

  return {
    cyclone,
    districts,
    updates,
    holidayPrediction,
    riskSummary,
  };
}

/**
 * Mock Data Generator class for easy use
 */
export class MockDataGenerator {
  generateCyclone = generateCyclone;
  generateDistricts = generateDistricts;
  generateUpdates = generateUpdates;
  generateHolidayPrediction = generateHolidayPrediction;
  generateRouteAnalysis = generateRouteAnalysis;
  generateRiskSummary = generateRiskSummary;
  generateMockDashboardData = generateMockDashboardData;
}

// Export singleton instance
export const mockDataGenerator = new MockDataGenerator();
