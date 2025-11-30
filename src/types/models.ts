import type {
  CycloneData,
  CycloneCategory,
  Coordinate,
  DistrictRisk,
  RiskLevel,
  SeverityColor,
  TravelRouteAnalysis,
  TimeWindow,
  RouteSegment,
  TravelRecommendation,
  Language,
} from './index';

export class CycloneEvent {
  id: string;
  name: string;
  pathway: Coordinate[];
  currentPosition: Coordinate;
  windSpeed: number;
  pressure: number;
  category: CycloneCategory;
  lastUpdated: Date;

  constructor(data: CycloneData) {
    this.id = data.id;
    this.name = data.name;
    this.pathway = data.pathway;
    this.currentPosition = data.currentPosition;
    this.windSpeed = data.windSpeed;
    this.pressure = data.pressure;
    this.category = data.category;
    this.lastUpdated = new Date(data.lastUpdated);
  }

  isActive(): boolean {
    const hoursSinceUpdate = (Date.now() - this.lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24;
  }

  getIntensityLevel(): 'low' | 'moderate' | 'high' | 'extreme' {
    if (this.windSpeed < 62) return 'low';
    if (this.windSpeed < 88) return 'moderate';
    if (this.windSpeed < 118) return 'high';
    return 'extreme';
  }
}

export class District {
  id: string;
  name: string;
  nameLocal: string; // Tamil name
  coordinates: Coordinate[];
  rainfallEstimate: number;
  floodingProbability: RiskLevel;
  waterloggingRisk: RiskLevel;
  windImpact: RiskLevel;
  severityScore: number;
  severityColor: SeverityColor;
  lastUpdated: Date;

  constructor(data: DistrictRisk & { nameLocal?: string; coordinates?: Coordinate[] }) {
    this.id = data.districtId;
    this.name = data.districtName;
    this.nameLocal = data.nameLocal || data.districtName;
    this.coordinates = data.coordinates || [];
    this.rainfallEstimate = data.rainfallEstimate;
    this.floodingProbability = data.floodingProbability;
    this.waterloggingRisk = data.waterloggingRisk;
    this.windImpact = data.windImpact;
    this.severityScore = data.severityScore;
    this.severityColor = data.severityColor;
    this.lastUpdated = new Date();
  }

  isHighRisk(): boolean {
    return this.severityScore >= 7;
  }

  getDisplayName(language: Language): string {
    return language === 'ta' ? this.nameLocal : this.name;
  }
}

export class TravelRoute {
  source: string;
  destination: string;
  affectedDistricts: District[];
  maxRainfall: number;
  disruptionWindows: TimeWindow[];
  recommendation: TravelRecommendation;
  riskSegments: RouteSegment[];

  constructor(analysis: TravelRouteAnalysis, districts: District[]) {
    this.source = analysis.source;
    this.destination = analysis.destination;
    this.affectedDistricts = districts.filter((d) =>
      analysis.affectedDistricts.includes(d.id)
    );
    this.maxRainfall = analysis.maxRainfall;
    this.disruptionWindows = analysis.disruptionWindows.map((w) => ({
      ...w,
      start: new Date(w.start),
      end: new Date(w.end),
    }));
    this.recommendation = analysis.recommendation;
    this.riskSegments = analysis.riskSegments;
  }

  isSafe(): boolean {
    return this.recommendation === 'safe';
  }

  getHighRiskSegments(): RouteSegment[] {
    return this.riskSegments.filter((seg) => seg.riskLevel === 'high');
  }

  getCurrentDisruptionLevel(): RiskLevel | null {
    const now = new Date();
    const activeWindow = this.disruptionWindows.find(
      (w) => w.start <= now && w.end >= now
    );
    return activeWindow?.severity || null;
  }
}
