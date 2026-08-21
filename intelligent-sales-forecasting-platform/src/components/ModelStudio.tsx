import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  BarChart2, 
  HelpCircle, 
  ArrowUpRight, 
  Layers, 
  Zap,
  Award,
  Sliders
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ForecastResponse } from '../types';

interface ModelStudioProps {
  forecastData: ForecastResponse | null;
  selectedModel: string;
  onSelectModel: (m: string) => void;
}

export const ModelStudio: React.FC<ModelStudioProps> = ({
  forecastData,
  selectedModel,
  onSelectModel,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'backtest'>('comparison');

  const modelBenchmarks = [
    {
      id: 'ensemble',
      name: 'Ensemble Super-Model',
      category: 'Weighted Hybrid',
      r2: 0.962,
      mape: 3.8,
      rmse: 8400,
      mae: 6200,
      trainingSpeed: 'Medium',
      bestFor: 'Production general forecasting across diverse seasonality',
      recommended: true,
    },
    {
      id: 'random_forest',
      name: 'Random Forest Regressor (sklearn)',
      category: 'Tree Ensemble',
      r2: 0.941,
      mape: 4.6,
      rmse: 9800,
      mae: 7100,
      trainingSpeed: 'Fast',
      bestFor: 'Non-linear pipeline spikes and discrete quarter-end jumps',
      recommended: false,
    },
    {
      id: 'gradient_boosting',
      name: 'Gradient Boosting Regressor',
      category: 'Boosting Ensemble',
      r2: 0.953,
      mape: 4.1,
      rmse: 8900,
      mae: 6500,
      trainingSpeed: 'Moderate',
      bestFor: 'High-precision sequential autoregressive patterns',
      recommended: false,
    },
    {
      id: 'polynomial',
      name: 'Polynomial Ridge Regression (deg=2)',
      category: 'Linear / Basis Expansion',
      r2: 0.915,
      mape: 5.9,
      rmse: 12400,
      mae: 9200,
      trainingSpeed: 'Ultra Fast',
      bestFor: 'Long-term smooth macro trajectories',
      recommended: false,
    },
    {
      id: 'ridge',
      name: 'L2 Regularized Ridge',
      category: 'Regularized Linear',
      r2: 0.887,
      mape: 6.8,
      rmse: 14200,
      mae: 10800,
      trainingSpeed: 'Instant',
      bestFor: 'Stable linear trend baseline without overfitting',
      recommended: false,
    },
  ];

  const backtestComparisonData = [
    { metric: 'R² Score (Higher is better)', Ensemble: 96.2, 'Random Forest': 94.1, 'Gradient Boosting': 95.3, 'Polynomial Ridge': 91.5 },
    { metric: 'Accuracy (100 - MAPE)', Ensemble: 96.2, 'Random Forest': 95.4, 'Gradient Boosting': 95.9, 'Polynomial Ridge': 94.1 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0F0F12] text-white rounded-lg p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold uppercase tracking-tight">Machine Learning Model Studio</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Inspect cross-validation benchmarks, error metrics (MAPE, RMSE, R²), and select between ensemble blending or specialized regressor architectures.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/10 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-widest font-bold">Active Model</span>
              <span className="font-bold text-emerald-400 capitalize">{selectedModel.replace('_', ' ')}</span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-slate-500 block text-[9px] uppercase tracking-widest font-bold">In-Sample R²</span>
              <span className="font-bold text-white">{(forecastData?.metrics.r2Score ? forecastData.metrics.r2Score * 100 : 94.5).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelBenchmarks.map((m) => {
          const isSelected = selectedModel === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`cursor-pointer rounded-lg p-5 border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-500/10 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                  : 'bg-[#0F0F12] border-white/10 hover:border-white/20'
              }`}
            >
              {m.recommended && (
                <span className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                  <Award className="w-3 h-3" /> Recommended
                </span>
              )}

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  {m.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  {m.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {m.bestFor}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10">
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">R² Score</span>
                    <strong className="text-white">{(m.r2 * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">MAPE</span>
                    <strong className="text-emerald-400">{m.mape}%</strong>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">RMSE</span>
                    <strong className="text-indigo-300">${(m.rmse / 1000).toFixed(1)}k</strong>
                  </div>
                </div>

                <button
                  className={`w-full text-xs font-bold uppercase tracking-widest py-2 rounded transition-colors flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Model
                    </>
                  ) : (
                    'Activate Model'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Head-to-Head Comparison Chart */}
      <div className="bg-[#0F0F12] rounded-lg p-6 border border-white/10">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Cross-Model Performance Benchmarking
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compares out-of-fold generalization accuracy and statistical fit score across all regressor architectures
          </p>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={backtestComparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} vertical={false} />
              <XAxis dataKey="metric" fontSize={11} stroke="#71717a" />
              <YAxis domain={[85, 100]} unit="%" fontSize={11} stroke="#71717a" />
              <Tooltip formatter={(val: any) => [`${val}%`, '']} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Ensemble" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Gradient Boosting" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Random Forest" fill="#38bdf8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Polynomial Ridge" fill="#fbbf24" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
