import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Key, ExternalLink, Activity } from 'lucide-react';
import { alphaVantageService } from '../../api/alphaVantageService';
import { Modal } from './Modal';

export const AlphaVantageTicker = () => {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchCommodities = async () => {
    setLoading(true);
    try {
      const data = await alphaVantageService.getCommodityIntelligence();
      setCommodities(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
    setApiKeyInput(alphaVantageService.getApiKey());
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    alphaVantageService.setApiKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsKeyModalOpen(false);
      fetchCommodities();
    }, 800);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-xl p-4 shadow-md border border-slate-700/60 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-wide text-white">
                Alpha Vantage • Raw Material & Commodity Intelligence
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Market Synced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time commodity benchmarks driving inventory replacement valuation & landed cost forecasting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCommodities}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors disabled:opacity-50"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Market
          </button>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            API Key
          </button>
        </div>
      </div>

      {/* Commodity Ticker Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
        {commodities.map((comm) => {
          const isUp = comm.changePercent >= 0;
          return (
            <div
              key={comm.symbol}
              className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg p-3 transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {comm.symbol}
                </span>
                <span
                  className={`inline-flex items-center text-[11px] font-bold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? '+' : ''}{comm.changePercent}%
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold text-white tracking-tight">
                  ${comm.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">{comm.unit}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 truncate" title={comm.name}>
                {comm.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Alpha Vantage API Key Configuration Modal */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Alpha Vantage API Configuration"
        subtitle="Connect real-time financial market, FX and commodities intelligence to StockSense"
      >
        <form onSubmit={handleSaveKey} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 leading-relaxed">
            StockSense leverages Alpha Vantage API to track global commodity indices (Copper, Aluminum, Crude Oil, Steel) 
            to automatically calculate inventory replacement risk and supplier price escalation.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alpha Vantage API Key
            </label>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="e.g. demo or your personal free key"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Default is <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">demo</code>. 
              Get your free API key at{' '}
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-semibold underline inline-flex items-center gap-0.5"
              >
                alphavantage.co <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-medium text-center">
              ✓ API Key updated successfully! Fetching fresh market data...
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save & Test Connection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
