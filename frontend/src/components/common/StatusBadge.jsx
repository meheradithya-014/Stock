import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

export const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-300';

  const dotColor = {
    Draft: 'bg-slate-400',
    Waiting: 'bg-amber-500 animate-pulse',
    Ready: 'bg-blue-500',
    Done: 'bg-emerald-500',
    Canceled: 'bg-rose-500'
  }[status] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};
