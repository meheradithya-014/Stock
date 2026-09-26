import React, { useState } from 'react';
import { User, ShieldCheck, Key, Database, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { alphaVantageService } from '../../api/alphaVantageService';
import { mockDb } from '../../api/mockDatabase';
import { USER_ROLES } from '../../utils/constants';

export const ProfilePage = () => {
  const { user, switchRole, logout } = useAuth();
  const { refreshAll } = useInventory();

  const [apiKey, setApiKey] = useState(() => alphaVantageService.getApiKey());
  const [keySaved, setKeySaved] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    alphaVantageService.setApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Reset all demo data (products, receipts, deliveries, transfers, ledger) back to defaults?')) {
      mockDb.reset();
      refreshAll();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Operator Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system identity, role-based access control, market intelligence keys, and state storage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 text-2xl font-extrabold flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="font-bold text-slate-900 text-base">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {user?.role}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 text-left">Switch Active Role:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => switchRole(USER_ROLES.MANAGER)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                  user?.role === USER_ROLES.MANAGER
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => switchRole(USER_ROLES.STAFF)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                  user?.role === USER_ROLES.STAFF
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Staff
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Alpha Vantage API Key Setup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Alpha Vantage Market Data API</h3>
                  <p className="text-xs text-slate-500">Configure key for real-time commodity pricing and currency exchange</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g. demo"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {keySaved && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  API Key stored in local session.
                </p>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connects to{' '}
                <a
                  href="https://www.alphavantage.co/?utm_source=chatgpt.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 font-semibold underline inline-flex items-center gap-0.5"
                >
                  Alpha Vantage Official API <ExternalLink className="w-3 h-3" />
                </a>{' '}
                to retrieve spot indices for copper, aluminum, crude oil, and foreign exchange rates.
              </p>
            </form>
          </div>

          {/* Database Reset / Maintenance */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Demo Data & Storage Maintenance</h3>
                  <p className="text-xs text-slate-500">Reset local browser state to default mock enterprise scenario</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-700">Restore Default Fixtures</p>
                <p className="text-[11px] text-slate-500">Reinitializes the 6 products, initial receipts, deliveries, and ledger.</p>
              </div>
              <button
                onClick={handleResetDatabase}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Reset Mock State
              </button>
            </div>

            {resetSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Mock database reset to original scenario state.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
