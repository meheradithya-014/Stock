import React from 'react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, trend, color = 'emerald', onClick, active }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-100',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-100',
      badge: 'bg-amber-100 text-amber-800'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-400',
      activeBorder: 'border-blue-500 ring-2 ring-blue-100',
      badge: 'bg-blue-100 text-blue-800'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-400',
      activeBorder: 'border-rose-500 ring-2 ring-rose-100',
      badge: 'bg-rose-100 text-rose-800'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-400',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-100',
      badge: 'bg-indigo-100 text-indigo-800'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer ${scheme.border} ${active ? scheme.activeBorder : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheme.badge}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
