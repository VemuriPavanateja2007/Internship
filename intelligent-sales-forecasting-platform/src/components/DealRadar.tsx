import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  DollarSign, 
  ChevronRight,
  TrendingUp,
  User,
  Building,
  ShieldAlert
} from 'lucide-react';
import { DealOpportunity, DealPipelineResponse } from '../types';

interface DealRadarProps {
  pipelineData: DealPipelineResponse | null;
  onOpenDealModal: (deal: DealOpportunity) => void;
  onAddNewDeal: (deal: DealOpportunity) => void;
}

export const DealRadar: React.FC<DealRadarProps> = ({
  pipelineData,
  onOpenDealModal,
  onAddNewDeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Deal form state
  const [newDealName, setNewDealName] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newAmount, setNewAmount] = useState('85000');
  const [newStage, setNewStage] = useState<'Discovery' | 'Demo' | 'Proposal' | 'Negotiation' | 'Contract Sent'>('Proposal');
  const [newRepName, setNewRepName] = useState('Sarah Jenkins (Enterprise AE)');
  const [newRepWinRate, setNewRepWinRate] = useState('0.65');
  const [newAgeDays, setNewAgeDays] = useState('30');
  const [newTouchpoints, setNewTouchpoints] = useState('18');
  const [newDiscountPct, setNewDiscountPct] = useState('0.05');
  const [newDecisionMaker, setNewDecisionMaker] = useState(true);

  if (!pipelineData) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>Evaluating deal probabilities with Scikit-learn Random Forest Classifier...</p>
      </div>
    );
  }

  const { summary, deals } = pipelineData;

  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.dealName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.repName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || d.stage === stageFilter;
    const matchesHealth =
      healthFilter === 'ALL' ||
      (healthFilter === 'HIGH' && (d.winProbability || 0) >= 70) ||
      (healthFilter === 'MEDIUM' && (d.winProbability || 0) >= 45 && (d.winProbability || 0) < 70) ||
      (healthFilter === 'AT_RISK' && (d.winProbability || 0) < 45);

    return matchesSearch && matchesStage && matchesHealth;
  });

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName || !newAccount) return;

    const newDeal: DealOpportunity = {
      id: `deal-${Date.now()}`,
      dealName: newDealName,
      account: newAccount,
      amount: parseFloat(newAmount) || 50000,
      stage: newStage,
      repName: newRepName,
      repWinRate: parseFloat(newRepWinRate) || 0.55,
      ageDays: parseInt(newAgeDays) || 20,
      touchpoints: parseInt(newTouchpoints) || 12,
      discountPct: parseFloat(newDiscountPct) || 0.05,
      decisionMakerEngaged: newDecisionMaker,
    };

    onAddNewDeal(newDeal);
    setShowAddForm(false);
    setNewDealName('');
    setNewAccount('');
  };

  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Pipeline Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Total Pipeline Value
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight">
              {formatCurrency(summary.totalPipelineValue)}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">{summary.totalDealsCount} active opportunities</p>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-indigo-400"></div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              ML Expected Value
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight font-mono text-emerald-400">
              {formatCurrency(summary.totalExpectedValue)}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">Weighted probability sum</p>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[68%] h-full bg-emerald-400"></div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Weighted Win Rate
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light text-white tracking-tight font-mono">
              {summary.weightedWinRate}%
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">Conversion baseline</p>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[62%] h-full bg-indigo-400"></div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Risk Tier Breakdown
            </span>
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {summary.highConfidenceDeals} High
            </span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {summary.mediumConfidenceDeals} Med
            </span>
            <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              {summary.atRiskDeals} Risk
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
            <div className="w-[90%] h-full bg-amber-400"></div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar & Quick Add Button */}
      <div className="bg-[#0F0F12] rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px] flex-wrap sm:flex-nowrap">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search opportunity, account, or rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090B] border border-white/10 text-xs rounded pl-9 pr-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#09090B] border border-white/10 text-xs rounded px-3 py-2 text-slate-200 cursor-pointer focus:outline-none focus:border-indigo-400"
          >
            <option value="ALL">All Stages</option>
            <option value="Discovery">Discovery</option>
            <option value="Demo">Demo</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Contract Sent">Contract Sent</option>
          </select>

          {/* Health Tier Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="bg-[#09090B] border border-white/10 text-xs rounded px-3 py-2 text-slate-200 cursor-pointer focus:outline-none focus:border-indigo-400"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Fit (≥70%)</option>
            <option value="MEDIUM">Medium / Comp (45-69%)</option>
            <option value="AT_RISK">At Risk (&lt;45%)</option>
          </select>
        </div>

        <button
          id="btn-add-opportunity"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* 3. Add Opportunity Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleCreateDeal} className="bg-[#0F0F12] rounded-lg p-5 border border-indigo-400/40 text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Score New Sales Opportunity
            </h4>
            <span className="text-slate-500 font-mono text-[10px]">Scikit-Learn Classifier Real-time Inference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Opportunity Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Expansion"
                value={newDealName}
                onChange={(e) => setNewDealName(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Account / Client</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Deal Amount ($)</label>
              <input
                type="number"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Sales Stage</label>
              <select
                value={newStage}
                onChange={(e: any) => setNewStage(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="Discovery">Discovery</option>
                <option value="Demo">Demo</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Contract Sent">Contract Sent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Sales Rep</label>
              <input
                type="text"
                value={newRepName}
                onChange={(e) => setNewRepName(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Deal Age (Days)</label>
              <input
                type="number"
                value={newAgeDays}
                onChange={(e) => setNewAgeDays(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Touchpoints</label>
              <input
                type="number"
                value={newTouchpoints}
                onChange={(e) => setNewTouchpoints(e.target.value)}
                className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="chk-decision-maker"
                checked={newDecisionMaker}
                onChange={(e) => setNewDecisionMaker(e.target.checked)}
                className="rounded bg-[#09090B] border-white/10 text-indigo-500"
              />
              <label htmlFor="chk-decision-maker" className="text-slate-300 cursor-pointer text-xs">
                Decision Maker Engaged
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded border border-white/10 text-slate-400 hover:text-white uppercase tracking-wider text-[10px] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-indigo-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-400 transition-colors"
            >
              Score Deal
            </button>
          </div>
        </form>
      )}

      {/* 4. Deals Table */}
      <div className="bg-[#0F0F12] rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-500 uppercase font-bold text-[9px] tracking-widest border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Opportunity & Account</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Deal Value</th>
                <th className="py-3 px-3">Win Probability</th>
                <th className="py-3 px-3">Expected Value</th>
                <th className="py-3 px-3">Age / Touches</th>
                <th className="py-3 px-3">Risk Assessment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDeals.map((deal) => {
                const winProb = deal.winProbability || 50;
                const isHigh = winProb >= 70;
                const isMed = winProb >= 45 && winProb < 70;

                return (
                  <tr
                    key={deal.id}
                    onClick={() => onOpenDealModal(deal)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {deal.dealName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{deal.account}</span>
                        <span>•</span>
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{deal.repName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                        {deal.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {formatCurrency(deal.amount)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-emerald-400' : isMed ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${winProb}%` }}
                          ></div>
                        </div>
                        <span className="font-bold font-mono text-white">
                          {winProb}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-semibold">
                      {formatCurrency(deal.expectedValue || deal.amount * (winProb / 100))}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{deal.ageDays}d ({deal.touchpoints} touch)</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isHigh
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isMed
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isHigh ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : isMed ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {deal.healthTier || (isHigh ? 'Strong Fit' : isMed ? 'Medium' : 'At Risk')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDealModal(deal);
                        }}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider text-[10px]"
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
