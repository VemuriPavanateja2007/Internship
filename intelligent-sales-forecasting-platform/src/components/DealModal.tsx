import React from 'react';
import { 
  X, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { DealOpportunity } from '../types';

interface DealModalProps {
  deal: DealOpportunity | null;
  onClose: () => void;
}

export const DealModal: React.FC<DealModalProps> = ({ deal, onClose }) => {
  if (!deal) return null;

  const winProb = deal.winProbability || 50;
  const isHigh = winProb >= 70;
  const isMed = winProb >= 45 && winProb < 70;

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0F0F12] border border-white/10 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-white/5 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {deal.stage}
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                isHigh ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                isMed ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {deal.healthTier || (isHigh ? 'Strong Win' : 'At Risk')}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 uppercase tracking-tight">
              {deal.dealName}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{deal.account}</span>
              <span>•</span>
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{deal.repName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="bg-white/5 p-3 rounded border border-white/10 text-center">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Total Deal Size</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {formatCurrency(deal.amount)}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded border border-white/10 text-center">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Win Probability</span>
              <span className={`text-base font-bold mt-0.5 block ${
                isHigh ? 'text-emerald-400' : isMed ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {winProb}%
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded border border-white/10 text-center">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Expected Revenue</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {formatCurrency(deal.expectedValue || deal.amount * (winProb / 100))}
              </span>
            </div>
          </div>

          {/* Prescriptive Recommended Winning Action */}
          <div className="bg-indigo-500/10 border border-indigo-400/30 rounded p-4 text-slate-200">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1 text-[10px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Prescriptive Playbook Action</span>
            </div>
            <p className="text-xs font-normal text-slate-200 leading-relaxed mt-1">
              {deal.recommendedAction || "Coordinate with executive economic buyer and establish formal mutual close plan with IT security."}
            </p>
          </div>

          {/* Positive Catalysts vs Risk Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Drivers */}
            <div className="bg-white/5 rounded p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2.5 text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Positive Signals & Catalysts</span>
              </div>
              <ul className="space-y-2">
                {deal.positiveFactors && deal.positiveFactors.length > 0 ? (
                  deal.positiveFactors.map((fac, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{fac}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No strong positive signals detected yet.</li>
                )}
              </ul>
            </div>

            {/* Risk Drivers */}
            <div className="bg-white/5 rounded p-4 border border-white/10">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-2.5 text-[10px] uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Risk Drivers</span>
              </div>
              <ul className="space-y-2">
                {deal.riskFactors && deal.riskFactors.length > 0 ? (
                  deal.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No severe risk flags identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Deal Metadata Footer */}
          <div className="bg-white/5 rounded p-3 border border-white/10 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500">
            <div>
              <span>Cycle Duration: </span>
              <strong className="text-slate-200">{deal.ageDays} Days</strong>
            </div>
            <div>
              <span>Touchpoints: </span>
              <strong className="text-slate-200">{deal.touchpoints} Interactions</strong>
            </div>
            <div>
              <span>Economic Buyer: </span>
              <strong className={deal.decisionMakerEngaged ? 'text-emerald-400' : 'text-rose-400'}>
                {deal.decisionMakerEngaged ? 'Engaged' : 'Missing'}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-indigo-400 transition-colors shadow-sm"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
