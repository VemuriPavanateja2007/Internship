import React from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  Activity, 
  Cpu, 
  Sliders, 
  Target, 
  Database, 
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { IndustryDatasetPreset } from '../types';
import { INDUSTRY_PRESETS } from '../data/sampleDatasets';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPreset: IndustryDatasetPreset;
  onSelectPreset: (preset: IndustryDatasetPreset) => void;
  isRecalculating: boolean;
  onTriggerRecalculation: () => void;
  mlEngineStatus: {
    healthy: boolean;
    hasSklearn: boolean;
    hasFlask: boolean;
  };
  onExportData: () => void;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedPreset,
  onSelectPreset,
  isRecalculating,
  onTriggerRecalculation,
  mlEngineStatus,
  onExportData,
  onOpenUploadModal,
}) => {
  const tabs = [
    { id: 'forecast', label: 'Forecast Hub', icon: TrendingUp },
    { id: 'model_studio', label: 'Predictive Models', icon: Cpu },
    { id: 'deal_radar', label: 'Sales Pipeline', icon: Target },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'ai_copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'datasets', label: 'Data Ingestion', icon: Database },
  ];

  return (
    <header className="bg-[#09090B] text-slate-200 border-b border-white/10 sticky top-0 z-40">
      {/* Top Geometric Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Predictive Engine</span>
            <span className="font-mono text-emerald-400 font-semibold text-xs">Flask + Scikit-Learn</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Matrix Core</span>
            <span className="font-mono text-indigo-400 font-semibold text-xs">NumPy v1.24+</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-4">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Reasoning</span>
            <span className="font-mono text-purple-400 font-semibold text-xs">Gemini 2.5 Flash</span>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 border border-white/10">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Domain:</span>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = INDUSTRY_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-[#09090B] text-slate-200 text-xs rounded px-2 py-0.5 font-medium border border-white/10 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {INDUSTRY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#09090B] text-slate-200">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-trigger-forecast"
            onClick={onTriggerRecalculation}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Training...' : 'Retrain'}</span>
          </button>

          <button
            id="btn-upload-csv-quick"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1.5 rounded text-[11px] border border-white/10 transition-colors uppercase tracking-wider font-semibold"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            id="btn-export-forecast"
            onClick={onExportData}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1.5 rounded text-[11px] border border-white/10 transition-colors uppercase tracking-wider font-semibold"
            title="Export forecast dataset"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Title & Nav Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          {/* Geometric Brand Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-sm flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white uppercase">
                  Vectra <span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Sales Forecasting
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Predictive revenue time-series modeling & pipeline risk intelligence
              </p>
            </div>
          </div>

          {/* Right Neural Core Status */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">Neural Core</p>
              <p className="text-sm font-mono text-emerald-400 font-medium">v4.2 ACTIVE</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full animate-pulse ${mlEngineStatus.healthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-6 overflow-x-auto border-t border-white/10 scrollbar-none pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2.5 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
