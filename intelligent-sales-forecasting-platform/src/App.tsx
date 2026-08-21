import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ForecastHub } from './components/ForecastHub';
import { ModelStudio } from './components/ModelStudio';
import { DealRadar } from './components/DealRadar';
import { ScenarioSimulatorView } from './components/ScenarioSimulatorView';
import { AiCopilotView } from './components/AiCopilotView';
import { DatasetManager } from './components/DatasetManager';
import { DealModal } from './components/DealModal';
import { INDUSTRY_PRESETS } from './data/sampleDatasets';
import { 
  IndustryDatasetPreset, 
  ForecastResponse, 
  DealPipelineResponse, 
  AIExecutiveReport, 
  DealOpportunity,
  SimulationParams,
  SimulationResponse
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('forecast');
  const [selectedPreset, setSelectedPreset] = useState<IndustryDatasetPreset>(INDUSTRY_PRESETS[0]);
  const [historicalData, setHistoricalData] = useState<{ date: string; revenue: number }[]>(INDUSTRY_PRESETS[0].historicalData);
  const [activeDeals, setActiveDeals] = useState<DealOpportunity[]>(INDUSTRY_PRESETS[0].sampleDeals);

  // Forecast state
  const [horizonMonths, setHorizonMonths] = useState<number>(6);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [selectedModel, setSelectedModel] = useState<string>('ensemble');
  const [targetMultiplier, setTargetMultiplier] = useState<number>(1.15);

  // Model & AI result states
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [pipelineData, setPipelineData] = useState<DealPipelineResponse | null>(null);
  const [aiReport, setAiReport] = useState<AIExecutiveReport | null>(null);
  
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [inspectedDeal, setInspectedDeal] = useState<DealOpportunity | null>(null);

  const [mlEngineStatus, setMlEngineStatus] = useState<{
    healthy: boolean;
    hasSklearn: boolean;
    hasFlask: boolean;
  }>({
    healthy: true,
    hasSklearn: true,
    hasFlask: true,
  });

  // Check health on mount
  useEffect(() => {
    fetch('/api/ml/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.mlEngine) {
          setMlEngineStatus({
            healthy: data.mlEngine.status === 'healthy',
            hasSklearn: data.mlEngine.has_sklearn ?? true,
            hasFlask: data.mlEngine.has_flask ?? true,
          });
        }
      })
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  // Recalculate Forecast
  const runForecastPipeline = useCallback(async () => {
    setIsRecalculating(true);
    try {
      // 1. Run Machine Learning Regression Forecast via Python/Flask backend
      const fcResponse = await fetch('/api/ml/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historicalData,
          horizonMonths,
          modelType: selectedModel,
          confidenceLevel,
          growthDriverMultiplier: 1.0,
        }),
      });
      const fcJson: ForecastResponse = await fcResponse.json();
      setForecastData(fcJson);

      // 2. Score Deals via Scikit-Learn Classifier
      const dealResponse = await fetch('/api/ml/score-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deals: activeDeals,
        }),
      });
      const dealJson: DealPipelineResponse = await dealResponse.json();
      setPipelineData(dealJson);

      // 3. Trigger AI Executive Analysis
      generateAiReport(fcJson);
    } catch (err) {
      console.error('Error running forecast pipeline:', err);
    } finally {
      setIsRecalculating(false);
    }
  }, [historicalData, horizonMonths, selectedModel, confidenceLevel, activeDeals]);

  // Generate AI Executive Report
  const generateAiReport = async (fc: ForecastResponse) => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/forecast-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecastSummary: fc.summary,
          metrics: fc.metrics,
          featureImportance: fc.featureImportance,
          currentHorizon: horizonMonths,
          industry: selectedPreset.name,
        }),
      });
      const report: AIExecutiveReport = await res.json();
      setAiReport(report);
    } catch (e) {
      console.error('Failed to generate AI executive report:', e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Run initial forecast on mount or when dependencies change
  useEffect(() => {
    runForecastPipeline();
  }, [runForecastPipeline]);

  // Preset switch
  const handleSelectPreset = (preset: IndustryDatasetPreset) => {
    setSelectedPreset(preset);
    setHistoricalData(preset.historicalData);
    setActiveDeals(preset.sampleDeals);
    if (preset.baselineParams?.horizonMonths) {
      setHorizonMonths(preset.baselineParams.horizonMonths);
    }
  };

  // What-If Simulation API caller
  const handleRunSimulation = async (params: SimulationParams): Promise<SimulationResponse> => {
    const baselineRev = forecastData?.summary.totalProjectedRevenue || 1200000;
    const res = await fetch('/api/ml/simulate-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baselineRevenue: baselineRev,
        ...params,
      }),
    });
    return res.json();
  };

  // AI Copilot Question handler
  const handleAskCopilot = async (question: string): Promise<string> => {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        forecastContext: {
          industry: selectedPreset.name,
          forecastSummary: forecastData?.summary,
          metrics: forecastData?.metrics,
          topFeatures: forecastData?.featureImportance?.slice(0, 3),
          pipelineSummary: pipelineData?.summary,
        },
      }),
    });
    const data = await res.json();
    return data.answer;
  };

  // Add new deal to pipeline
  const handleAddNewDeal = (newDeal: DealOpportunity) => {
    const updated = [newDeal, ...activeDeals];
    setActiveDeals(updated);
    // Re-score pipeline immediately
    fetch('/api/ml/score-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deals: updated }),
    })
      .then((r) => r.json())
      .then((scored) => setPipelineData(scored));
  };

  const handleExportData = () => {
    if (!forecastData) return;
    const jsonStr = JSON.stringify(forecastData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_forecast_report_${selectedPreset.id}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        isRecalculating={isRecalculating}
        onTriggerRecalculation={runForecastPipeline}
        mlEngineStatus={mlEngineStatus}
        onExportData={handleExportData}
        onOpenUploadModal={() => setActiveTab('datasets')}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'forecast' && (
          <ForecastHub
            forecastData={forecastData}
            aiReport={aiReport}
            isLoadingAI={isLoadingAI}
            onRefreshAIReport={() => forecastData && generateAiReport(forecastData)}
            horizonMonths={horizonMonths}
            setHorizonMonths={setHorizonMonths}
            confidenceLevel={confidenceLevel}
            setConfidenceLevel={setConfidenceLevel}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            targetMultiplier={targetMultiplier}
            setTargetMultiplier={setTargetMultiplier}
          />
        )}

        {activeTab === 'model_studio' && (
          <ModelStudio
            forecastData={forecastData}
            selectedModel={selectedModel}
            onSelectModel={(m) => {
              setSelectedModel(m);
            }}
          />
        )}

        {activeTab === 'deal_radar' && (
          <DealRadar
            pipelineData={pipelineData}
            onOpenDealModal={(deal) => setInspectedDeal(deal)}
            onAddNewDeal={handleAddNewDeal}
          />
        )}

        {activeTab === 'simulator' && (
          <ScenarioSimulatorView
            baselineRevenue={forecastData?.summary.totalProjectedRevenue || 1200000}
            onRunSimulation={handleRunSimulation}
          />
        )}

        {activeTab === 'ai_copilot' && (
          <AiCopilotView
            forecastData={forecastData}
            pipelineData={pipelineData}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {activeTab === 'datasets' && (
          <DatasetManager
            historicalData={historicalData}
            onUpdateHistoricalData={(newData) => {
              setHistoricalData(newData);
            }}
            onRetrain={runForecastPipeline}
          />
        )}
      </main>

      {/* Geometric Balance Footer */}
      <footer className="h-10 bg-[#09090B] border-t border-white/10 flex items-center px-4 sm:px-8 justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span>SYSTEM STATUS: NOMINAL</span>
          <span className="hidden sm:inline text-slate-700">//</span>
          <span className="hidden sm:inline">ENCRYPTION: AES-256</span>
          <span className="hidden md:inline text-slate-700">//</span>
          <span className="hidden md:inline text-emerald-400">ML: SCIKIT-LEARN 1.2+</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden lg:inline">LAST SYNC: REAL-TIME INGESTION</span>
          <span>© 2026 VECTRA PREDICTIVE ANALYTICS</span>
        </div>
      </footer>

      {/* Deal Detail Audit Modal */}
      {inspectedDeal && (
        <DealModal
          deal={inspectedDeal}
          onClose={() => setInspectedDeal(null)}
        />
      )}
    </div>
  );
}
