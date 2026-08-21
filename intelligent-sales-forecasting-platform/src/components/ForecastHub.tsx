import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  BarChart3,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { ForecastResponse, AIExecutiveReport } from '../types';

interface ForecastHubProps {
  forecastData: ForecastResponse | null;
  aiReport: AIExecutiveReport | null;
  isLoadingAI: boolean;
  onRefreshAIReport: () => void;
  horizonMonths: number;
  setHorizonMonths: (h: number) => void;
  confidenceLevel: number;
  setConfidenceLevel: (c: number) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  targetMultiplier: number;
  setTargetMultiplier: (t: number) => void;
}

export const ForecastHub: React.FC<ForecastHubProps> = ({
  forecastData,
  aiReport,
  isLoadingAI,
  onRefreshAIReport,
  horizonMonths,
  setHorizonMonths,
  confidenceLevel,
  setConfidenceLevel,
  selectedModel,
  setSelectedModel,
  targetMultiplier,
  setTargetMultiplier,
}) => {
  const [activeChartView, setActiveChartView] = useState<'forecast' | 'decomposition'>('forecast');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  if (!forecastData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Training machine learning regression models & calculating confidence intervals...</p>
        </div>
      </div>
    );
  }

  const { metrics, summary, featureImportance, historical, forecast } = forecastData;

  // Combine historical and forecast data for the unified time-series chart
  const combinedChartData: any[] = [];

  // Add historical points
  historical.forEach((h) => {
    combinedChartData.push({
      date: h.date,
      label: h.label,
      actualRevenue: h.actualRevenue,
      fittedRevenue: h.fittedRevenue,
      isForecast: false,
      trend: h.trend,
      seasonality: h.seasonality,
      residual: h.residual,
      target: h.actualRevenue * targetMultiplier,
    });
  });

  // Add forecast points
  forecast.forEach((f) => {
    combinedChartData.push({
      date: f.date,
      label: f.label,
      predictedRevenue: f.predictedRevenue,
      lowerBound95: f.lowerBound95,
      upperBound95: f.upperBound95,
      lowerBound80: f.lowerBound80,
      upperBound80: f.upperBound80,
      confidenceBand: [f.lowerBound95, f.upperBound95],
      confidenceBand80: [f.lowerBound80, f.upperBound80],
      isForecast: true,
      target: f.predictedRevenue * targetMultiplier,
      trend: f.baselineTrend,
      seasonality: f.seasonalLift,
    });
  });

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Executive Metrics Cards - Geometric Balance style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projected Revenue */}
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Projected Revenue ({summary.horizonMonths}M)
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight">
              {formatCurrency(summary.totalProjectedRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-mono font-semibold ${
                summary.projectedGrowthRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {summary.projectedGrowthRate >= 0 ? '+' : ''}{summary.projectedGrowthRate}% YoY Growth
              </span>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[82%] h-full bg-indigo-400"></div>
          </div>
        </div>

        {/* Card 2: Model Accuracy (R²) */}
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Model Accuracy (R²)
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight font-mono">
              {(metrics.r2Score * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-emerald-400">
                MAPE: {metrics.mape}%
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">High Stability</span>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[94%] h-full bg-emerald-400"></div>
          </div>
        </div>

        {/* Card 3: Model In-Use */}
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Active Regressor
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-medium text-white tracking-tight capitalize truncate">
              {forecastData.modelUsed.replace('_', ' ')}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
              <span>RMSE: {formatCurrency(metrics.rmse)}</span>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[88%] h-full bg-indigo-400"></div>
          </div>
        </div>

        {/* Card 4: Target Quota Benchmark */}
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Target Quota Delta
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight font-mono">
              {targetMultiplier >= 1.0 ? `+${Math.round((targetMultiplier - 1) * 100)}%` : `-${Math.round((1 - targetMultiplier) * 100)}%`}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Gap: <strong className="text-amber-400 font-mono">{formatCurrency(summary.totalProjectedRevenue * (targetMultiplier - 1))}</strong></span>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[75%] h-full bg-amber-400"></div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Control Ribbon */}
      <div className="bg-[#0F0F12] rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Horizon selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Horizon:
          </span>
          <div className="inline-flex rounded bg-white/5 p-0.5 border border-white/10 text-xs font-mono">
            {[
              { label: '1M', val: 1 },
              { label: '3M', val: 3 },
              { label: '6M', val: 6 },
              { label: '12M', val: 12 },
              { label: '24M', val: 24 },
            ].map((h) => (
              <button
                key={h.val}
                id={`btn-horizon-${h.val}`}
                onClick={() => setHorizonMonths(h.val)}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  horizonMonths === h.val
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Regressor:
          </span>
          <select
            id="select-ml-model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#09090B] border border-white/10 text-xs font-medium rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ensemble" className="bg-[#09090B]">Ensemble Super-Model (RF + GB + Ridge)</option>
            <option value="random_forest" className="bg-[#09090B]">Random Forest Regressor (Scikit-Learn)</option>
            <option value="gradient_boosting" className="bg-[#09090B]">Gradient Boosting Regressor</option>
            <option value="polynomial" className="bg-[#09090B]">Polynomial Ridge Regression</option>
            <option value="ridge" className="bg-[#09090B]">L2 Regularized Ridge</option>
          </select>
        </div>

        {/* Confidence Interval & Quota Toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Confidence:</span>
            <div className="inline-flex rounded bg-white/5 p-0.5 border border-white/10 text-xs font-mono">
              <button
                id="btn-confidence-80"
                onClick={() => setConfidenceLevel(0.80)}
                className={`px-2.5 py-1 font-medium rounded transition-colors ${
                  confidenceLevel === 0.80 ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                80%
              </button>
              <button
                id="btn-confidence-95"
                onClick={() => setConfidenceLevel(0.95)}
                className={`px-2.5 py-1 font-medium rounded transition-colors ${
                  confidenceLevel === 0.95 ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                95%
              </button>
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showConfidenceBands}
              onChange={(e) => setShowConfidenceBands(e.target.checked)}
              className="rounded bg-[#09090B] border-white/10 text-indigo-500 focus:ring-0"
            />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Uncertainty Bounds</span>
          </label>
        </div>
      </div>

      {/* 3. Main Chart Canvas Area */}
      <div className="bg-[#0F0F12] rounded-lg p-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
              <span>Predictive Revenue Trajectory</span>
              <span className="text-xs font-mono text-slate-500">({metrics.sampleCount}M historical + {summary.horizonMonths}M forecast)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Autoregressive Scikit-Learn regression with {metrics.confidenceLevel} certainty intervals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded bg-white/5 p-0.5 border border-white/10 text-xs">
              <button
                onClick={() => setActiveChartView('forecast')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeChartView === 'forecast' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Forecast View
              </button>
              <button
                onClick={() => setActiveChartView('decomposition')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeChartView === 'decomposition' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trend & Seasonality
              </button>
            </div>
          </div>
        </div>

        {activeChartView === 'forecast' ? (
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="confidenceBandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} vertical={false} />
                
                <XAxis 
                  dataKey="label" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                  dy={10} 
                />
                
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickFormatter={formatCurrency} 
                  tickLine={false} 
                  dx={-5}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#09090B] text-white p-3.5 rounded border border-white/10 text-xs space-y-2 min-w-[210px] shadow-2xl">
                          <div className="font-bold border-b border-white/10 pb-1.5 flex justify-between items-center">
                            <span>{label}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider ${
                              data.isForecast ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-400'
                            }`}>
                              {data.isForecast ? 'Forecast Point' : 'Historical Actual'}
                            </span>
                          </div>

                          {data.actualRevenue !== undefined && (
                            <div className="flex justify-between items-center text-slate-200">
                              <span className="text-slate-400">Actual Revenue:</span>
                              <span className="font-mono font-semibold text-white">{formatCurrency(data.actualRevenue)}</span>
                            </div>
                          )}

                          {data.fittedRevenue !== undefined && (
                            <div className="flex justify-between items-center text-slate-400">
                              <span>In-Sample Fit:</span>
                              <span className="font-mono">{formatCurrency(data.fittedRevenue)}</span>
                            </div>
                          )}

                          {data.predictedRevenue !== undefined && (
                            <div className="flex justify-between items-center text-indigo-400 font-bold">
                              <span>ML Predicted:</span>
                              <span className="font-mono text-sm">{formatCurrency(data.predictedRevenue)}</span>
                            </div>
                          )}

                          {data.upperBound95 !== undefined && showConfidenceBands && (
                            <div className="pt-1.5 border-t border-white/10 text-[11px] text-slate-400 flex justify-between">
                              <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">95% Range:</span>
                              <span className="font-mono text-indigo-300">
                                {formatCurrency(data.lowerBound95)} – {formatCurrency(data.upperBound95)}
                              </span>
                            </div>
                          )}

                          {data.target !== undefined && (
                            <div className="text-[11px] text-amber-400 flex justify-between">
                              <span>Quota Target:</span>
                              <span className="font-mono">{formatCurrency(data.target)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} 
                  iconType="circle"
                />

                {/* Confidence Band Area */}
                {showConfidenceBands && (
                  <Area
                    type="monotone"
                    dataKey="upperBound95"
                    stroke="none"
                    fill="url(#confidenceBandGradient)"
                    name="95% Confidence Interval"
                  />
                )}

                {/* Historical Actuals */}
                <Line
                  type="monotone"
                  dataKey="actualRevenue"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#38bdf8' }}
                  name="Historical Actual Revenue"
                  connectNulls={false}
                />

                {/* In-Sample Model Fit */}
                <Line
                  type="monotone"
                  dataKey="fittedRevenue"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Scikit-Learn In-Sample Fit"
                />

                {/* Machine Learning Forecast */}
                <Line
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#09090B' }}
                  name="Predicted Revenue (ML)"
                />

                {/* Quota Target Benchmark */}
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Quota Target Benchmark"
                />

                {/* Historical vs Forecast Boundary Line */}
                {historical.length > 0 && (
                  <ReferenceLine
                    x={historical[historical.length - 1].label}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{
                      value: 'FORECAST HORIZON ▶',
                      position: 'top',
                      fill: '#f43f5e',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Decomposition View */
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} vertical={false} />
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={formatCurrency} tickLine={false} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  dot={false}
                  name="Underlying Macro Trend"
                />
                <Bar
                  dataKey="seasonality"
                  fill="#34d399"
                  name="Seasonal Lift ($)"
                  opacity={0.8}
                />
                <Line
                  type="monotone"
                  dataKey="residual"
                  stroke="#fb7185"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={{ r: 2 }}
                  name="Residual Uncertainty"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. AI Strategic Executive Report & Strategic Recommendations (Gemini AI) */}
      <div className="bg-[#0F0F12] rounded-lg p-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                Executive Forecast Intelligence
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated CRO analysis synthesized from predictive ML weights, variance bounds, and pipeline dynamics
              </p>
            </div>
          </div>

          <button
            id="btn-refresh-ai-summary"
            onClick={onRefreshAIReport}
            disabled={isLoadingAI}
            className="py-2.5 px-4 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-indigo-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'Analyzing...' : 'Regenerate Analysis'}</span>
          </button>
        </div>

        {isLoadingAI ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-indigo-400">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono">Synthesizing predictive insights with Gemini 2.5 Flash...</p>
          </div>
        ) : aiReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            {/* Executive Summary */}
            <div className="lg:col-span-3 p-5 rounded bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  NARRATIVE: REVENUE TRAJECTORY
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Confidence: {aiReport.confidenceAssessment}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {aiReport.executiveSummary}
              </p>
            </div>

            {/* Key Drivers - Alert: Upside style */}
            <div className="p-4 rounded bg-white/5 border border-white/5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  ALERT: GROWTH DRIVERS
                </span>
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              </div>
              <ul className="space-y-2.5">
                {aiReport.keyDrivers?.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Risks - Risk: Churn style */}
            <div className="p-4 rounded bg-white/5 border border-white/5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                  RISK: REVENUE HEADWINDS
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <ul className="space-y-2.5">
                {aiReport.strategicRisks?.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Tactical Playbook */}
            <div className="p-4 rounded bg-white/5 border border-white/5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  TACTICAL PLAYBOOK
                </span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <ul className="space-y-2.5">
                {aiReport.recommendedActions?.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-emerald-400 font-mono font-bold">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* 5. Feature Importance Breakdown */}
      <div className="bg-[#0F0F12] rounded-lg p-6 border border-white/10">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Random Forest Feature Importances
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Predictive weights assigned to historical lags, momentum, and seasonality signals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} horizontal={false} />
                <XAxis type="number" unit="%" fontSize={10} stroke="#71717a" />
                <YAxis dataKey="feature" type="category" fontSize={11} stroke="#71717a" width={120} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Relative Weight']} />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs">
            {featureImportance.slice(0, 4).map((feat, idx) => (
              <div key={idx} className="p-3 rounded bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="font-medium text-slate-200">{feat.feature}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-white/10 rounded-full h-1 overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${feat.importance}%` }}></div>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold">{feat.importance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
