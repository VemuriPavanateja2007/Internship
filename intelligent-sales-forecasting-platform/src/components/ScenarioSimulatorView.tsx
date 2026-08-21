import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Layers, 
  RotateCcw, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Rocket,
  Building2
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SimulationParams, SimulationResponse } from '../types';

interface ScenarioSimulatorProps {
  baselineRevenue: number;
  onRunSimulation: (params: SimulationParams) => Promise<SimulationResponse>;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorProps> = ({
  baselineRevenue,
  onRunSimulation,
}) => {
  const [params, setParams] = useState<SimulationParams>({
    horizonMonths: 12,
    leadVolumeChangePct: 15,
    dealSizeChangePct: 10,
    conversionRateLiftPct: 8,
    salesRepsDelta: 2,
    churnRatePct: 1.8,
    macroMultiplier: 1.0,
  });

  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const executeSim = async (currentParams: SimulationParams) => {
    setIsSimulating(true);
    try {
      const res = await onRunSimulation(currentParams);
      setSimResult(res);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    executeSim(params);
  }, [baselineRevenue]);

  const handleParamChange = (field: keyof SimulationParams, value: number) => {
    const updated = { ...params, [field]: value };
    setParams(updated);
    executeSim(updated);
  };

  const applyPreset = (presetName: string) => {
    let updated: SimulationParams = { ...params };
    if (presetName === 'aggressive') {
      updated = {
        horizonMonths: 12,
        leadVolumeChangePct: 35,
        dealSizeChangePct: 15,
        conversionRateLiftPct: 12,
        salesRepsDelta: 5,
        churnRatePct: 1.2,
        macroMultiplier: 1.05,
      };
    } else if (presetName === 'recession') {
      updated = {
        horizonMonths: 12,
        leadVolumeChangePct: -20,
        dealSizeChangePct: -10,
        conversionRateLiftPct: -8,
        salesRepsDelta: -2,
        churnRatePct: 4.5,
        macroMultiplier: 0.9,
      };
    } else if (presetName === 'enterprise_pivot') {
      updated = {
        horizonMonths: 12,
        leadVolumeChangePct: -5,
        dealSizeChangePct: 45,
        conversionRateLiftPct: 5,
        salesRepsDelta: 1,
        churnRatePct: 1.0,
        macroMultiplier: 1.0,
      };
    } else {
      updated = {
        horizonMonths: 12,
        leadVolumeChangePct: 0,
        dealSizeChangePct: 0,
        conversionRateLiftPct: 0,
        salesRepsDelta: 0,
        churnRatePct: 2.0,
        macroMultiplier: 1.0,
      };
    }
    setParams(updated);
    executeSim(updated);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Presets */}
      <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-tight text-white">
              What-If Sales Sensitivity Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate revenue impacts of lead generation, quota capacity, pricing leverage, and churn adjustments.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Presets:</span>
          <button
            onClick={() => applyPreset('aggressive')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors uppercase tracking-wider"
          >
            <Rocket className="w-3.5 h-3.5" /> Aggressive Scale
          </button>
          <button
            onClick={() => applyPreset('enterprise_pivot')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors uppercase tracking-wider"
          >
            <Building2 className="w-3.5 h-3.5" /> Enterprise ACV
          </button>
          <button
            onClick={() => applyPreset('recession')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-colors uppercase tracking-wider"
          >
            <Shield className="w-3.5 h-3.5" /> Downturn Test
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 text-slate-400 hover:text-white text-[10px] font-mono font-bold border border-white/10 hover:bg-white/10 transition-colors uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* 2. Simulation Outcome Summary Cards */}
      {simResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Simulated {params.horizonMonths}M Revenue
            </span>
            <div className="mt-2 text-3xl font-light text-white tracking-tight">
              {formatCurrency(simResult.summary.totalSimulatedRevenue)}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-2">
              Baseline: {formatCurrency(simResult.summary.totalBaselineRevenue)}
            </p>
          </div>

          <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Net Revenue Delta
            </span>
            <div className={`mt-2 text-3xl font-light tracking-tight flex items-center gap-1 font-mono ${
              simResult.summary.netRevenueImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {simResult.summary.netRevenueImpact >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-rose-400" />
              )}
              <span>{formatCurrency(Math.abs(simResult.summary.netRevenueImpact))}</span>
            </div>
            <p className="text-xs font-mono font-bold mt-2 text-emerald-400">
              {simResult.summary.netImpactPct >= 0 ? '+' : ''}{simResult.summary.netImpactPct}% Total Delta
            </p>
          </div>

          <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Annualized Run Rate
            </span>
            <div className="mt-2 text-3xl font-light text-indigo-400 tracking-tight font-mono">
              {formatCurrency(simResult.summary.annualRunRate)}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-2">End of horizon annualized</p>
          </div>

          <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Active Parameters
            </span>
            <div className="mt-2 text-sm font-mono font-bold text-slate-200">
              {params.salesRepsDelta >= 0 ? `+${params.salesRepsDelta}` : params.salesRepsDelta} Reps • {params.leadVolumeChangePct}% Leads
            </div>
            <p className="text-xs font-mono text-slate-500 mt-2">
              ACV: {params.dealSizeChangePct >= 0 ? `+${params.dealSizeChangePct}%` : `${params.dealSizeChangePct}%`}
            </p>
          </div>
        </div>
      )}

      {/* 3. Sliders & Interactive Parametric Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Column */}
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 space-y-5 text-xs">
          <h3 className="font-bold text-slate-500 uppercase tracking-[0.2em] text-xs pb-2 border-b border-white/10">
            Sensitivity Levers
          </h3>

          {/* Lead Volume */}
          <div>
            <div className="flex justify-between font-mono text-slate-300 mb-1.5 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Lead Volume</span>
              <span className="font-bold text-indigo-400">
                {params.leadVolumeChangePct >= 0 ? `+${params.leadVolumeChangePct}%` : `${params.leadVolumeChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={params.leadVolumeChangePct}
              onChange={(e) => handleParamChange('leadVolumeChangePct', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>-50%</span>
              <span>Baseline</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Average Deal Size / ACV */}
          <div>
            <div className="flex justify-between font-mono text-slate-300 mb-1.5 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Deal Size (ACV)</span>
              <span className="font-bold text-indigo-400">
                {params.dealSizeChangePct >= 0 ? `+${params.dealSizeChangePct}%` : `${params.dealSizeChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="60"
              step="5"
              value={params.dealSizeChangePct}
              onChange={(e) => handleParamChange('dealSizeChangePct', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>-30%</span>
              <span>Baseline</span>
              <span>+60%</span>
            </div>
          </div>

          {/* Conversion Rate Lift */}
          <div>
            <div className="flex justify-between font-mono text-slate-300 mb-1.5 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Win Rate Lift</span>
              <span className="font-bold text-emerald-400">
                {params.conversionRateLiftPct >= 0 ? `+${params.conversionRateLiftPct}%` : `${params.conversionRateLiftPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              step="2"
              value={params.conversionRateLiftPct}
              onChange={(e) => handleParamChange('conversionRateLiftPct', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>-20%</span>
              <span>Baseline</span>
              <span>+40%</span>
            </div>
          </div>

          {/* Sales Reps Headcount */}
          <div>
            <div className="flex justify-between font-mono text-slate-300 mb-1.5 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">AE Headcount Delta</span>
              <span className="font-bold text-purple-400">
                {params.salesRepsDelta >= 0 ? `+${params.salesRepsDelta} Reps` : `${params.salesRepsDelta} Reps`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="15"
              step="1"
              value={params.salesRepsDelta}
              onChange={(e) => handleParamChange('salesRepsDelta', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>-5 Reps</span>
              <span>Current</span>
              <span>+15 Reps</span>
            </div>
          </div>

          {/* Monthly Churn Rate */}
          <div>
            <div className="flex justify-between font-mono text-slate-300 mb-1.5 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Annualized Churn</span>
              <span className="font-bold text-amber-400">
                {params.churnRatePct}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.5"
              value={params.churnRatePct}
              onChange={(e) => handleParamChange('churnRatePct', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>0.5% (Low)</span>
              <span>2.0% (Avg)</span>
              <span>8.0% (High)</span>
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-2 bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                Baseline vs Simulated Trajectory
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {isSimulating ? 'Recalculating...' : '● Live Dynamic Run'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Comparing cumulative monthly revenue yields over the projected {params.horizonMonths}-month timeline
            </p>
          </div>

          <div className="h-[320px] w-full">
            {simResult && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={simResult.monthlyBreakdown} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} vertical={false} />
                  <XAxis dataKey="month" fontSize={11} stroke="#71717a" />
                  <YAxis fontSize={11} stroke="#71717a" tickFormatter={formatCurrency} />
                  <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  
                  <Line
                    type="monotone"
                    dataKey="baselineRevenue"
                    stroke="#71717a"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Current Baseline Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedRevenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#6366f1' }}
                    name="Simulated Scenario Revenue"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
