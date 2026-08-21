import React, { useState, useRef } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { HistoricalDataPoint } from '../types';

interface DatasetManagerProps {
  historicalData: { date: string; revenue: number }[];
  onUpdateHistoricalData: (newData: { date: string; revenue: number }[]) => void;
  onRetrain: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  historicalData,
  onUpdateHistoricalData,
  onRetrain,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newRevenue, setNewRevenue] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newRevenue) return;

    const rev = parseFloat(newRevenue);
    if (isNaN(rev)) return;

    const updated = [...historicalData, { date: newDate, revenue: rev }];
    // Sort chronologically
    updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdateHistoricalData(updated);
    setNewDate('');
    setNewRevenue('');
  };

  const handleDeletePoint = (index: number) => {
    if (historicalData.length <= 3) {
      alert("At least 3 historical points are required for time-series forecasting.");
      return;
    }
    const updated = historicalData.filter((_, idx) => idx !== index);
    onUpdateHistoricalData(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          setUploadErrorMsg("CSV must contain a header and at least 2 data rows.");
          return;
        }

        const parsed: { date: string; revenue: number }[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 2) {
            const dateStr = parts[0].trim().replace(/['"]/g, '');
            const revVal = parseFloat(parts[1].trim().replace(/['"]/g, ''));
            if (!isNaN(revVal) && dateStr) {
              parsed.push({ date: dateStr, revenue: revVal });
            }
          }
        }

        if (parsed.length < 3) {
          setUploadErrorMsg("Could not parse at least 3 valid 'date, revenue' records from CSV.");
          return;
        }

        parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        onUpdateHistoricalData(parsed);
        setUploadSuccessMsg(`Successfully imported ${parsed.length} historical sales records! Retraining models...`);
        setUploadErrorMsg(null);
        setTimeout(() => setUploadSuccessMsg(null), 5000);
      } catch (err: any) {
        setUploadErrorMsg(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const header = "date,revenue\n";
    const rows = historicalData.map((d) => `${d.date},${d.revenue}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_historical_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-tight text-white">
              Dataset Ingestion & Machine Learning Data Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your historical time-series data points, import custom CSV files, or export cleaned sales records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {uploadErrorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{uploadErrorMsg}</span>
        </div>
      )}

      {/* Add New Record Row */}
      <form onSubmit={handleAddPoint} className="bg-[#0F0F12] rounded-lg p-5 border border-white/10 text-xs flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
            Month Date (YYYY-MM-01)
          </label>
          <input
            type="date"
            required
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
            Actual Revenue ($)
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 125000"
            value={newRevenue}
            onChange={(e) => setNewRevenue(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded p-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase tracking-widest text-[10px] rounded flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Record</span>
        </button>
      </form>

      {/* Historical Dataset Records Table */}
      <div className="bg-[#0F0F12] rounded-lg border border-white/10 overflow-hidden text-xs">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Time Series Historical Corpus ({historicalData.length} Months)</span>
          </h3>
          <button
            onClick={onRetrain}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider text-[10px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retrain Models</span>
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-white/5 text-slate-500 uppercase text-[9px] font-bold tracking-widest sticky top-0 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4">Index</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Recorded Revenue ($)</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historicalData.map((d, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">#{index + 1}</td>
                  <td className="py-2.5 px-4 font-mono text-white">{d.date}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">
                    ${d.revenue.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleDeletePoint(index)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
