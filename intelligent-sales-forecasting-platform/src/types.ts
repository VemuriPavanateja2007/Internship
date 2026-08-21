export interface HistoricalDataPoint {
  date: string;
  label?: string;
  revenue: number;
  fittedRevenue?: number;
  trend?: number;
  seasonality?: number;
  residual?: number;
}

export interface ForecastDataPoint {
  date: string;
  label: string;
  predictedRevenue: number;
  lowerBound95: number;
  upperBound95: number;
  lowerBound80: number;
  upperBound80: number;
  baselineTrend: number;
  seasonalLift: number;
  confidenceScore: number;
}

export interface ModelMetrics {
  r2Score: number;
  mape: number;
  rmse: number;
  mae: number;
  confidenceLevel: string;
  sampleCount: number;
}

export interface ForecastSummary {
  totalProjectedRevenue: number;
  avgMonthlyProjected: number;
  projectedGrowthRate: number;
  horizonMonths: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ForecastResponse {
  modelUsed: string;
  metrics: ModelMetrics;
  summary: ForecastSummary;
  featureImportance: FeatureImportance[];
  historical: {
    date: string;
    label: string;
    actualRevenue: number;
    fittedRevenue: number;
    trend: number;
    seasonality: number;
    residual: number;
  }[];
  forecast: ForecastDataPoint[];
}

export interface DealOpportunity {
  id: string;
  dealName: string;
  account: string;
  repName: string;
  stage: 'Discovery' | 'Demo' | 'Proposal' | 'Negotiation' | 'Contract Sent';
  amount: number;
  repWinRate: number;
  ageDays: number;
  touchpoints: number;
  discountPct: number;
  decisionMakerEngaged: boolean;
  industry?: string;
  winProbability?: number;
  expectedValue?: number;
  healthTier?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose';
  positiveFactors?: string[];
  riskFactors?: string[];
  recommendedAction?: string;
}

export interface DealPipelineResponse {
  summary: {
    totalPipelineValue: number;
    totalExpectedValue: number;
    weightedWinRate: number;
    totalDealsCount: number;
    highConfidenceDeals: number;
    mediumConfidenceDeals: number;
    atRiskDeals: number;
  };
  deals: DealOpportunity[];
}

export interface SimulationParams {
  horizonMonths: number;
  leadVolumeChangePct: number;
  dealSizeChangePct: number;
  conversionRateLiftPct: number;
  salesRepsDelta: number;
  churnRatePct: number;
  macroMultiplier: number;
}

export interface SimulationMonthlyPoint {
  month: string;
  baselineRevenue: number;
  simulatedRevenue: number;
  variance: number;
  variancePct: number;
  cumulativeSimulated: number;
  cumulativeBaseline: number;
}

export interface SimulationResponse {
  parameters: SimulationParams;
  summary: {
    totalBaselineRevenue: number;
    totalSimulatedRevenue: number;
    netRevenueImpact: number;
    netImpactPct: number;
    annualRunRate: number;
  };
  monthlyBreakdown: SimulationMonthlyPoint[];
}

export interface AIExecutiveReport {
  executiveSummary: string;
  keyDrivers: string[];
  strategicRisks: string[];
  recommendedActions: string[];
  confidenceAssessment: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface IndustryDatasetPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  historicalData: { date: string; revenue: number }[];
  sampleDeals: DealOpportunity[];
  baselineParams: Partial<SimulationParams>;
}
