import React, { useState } from 'react';
import { Plus, SlidersHorizontal, AlertOctagon, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AdjustmentModal } from '../../components/operations/AdjustmentModal';
import { formatDateTime } from '../../utils/formatters';

export const AdjustmentsPage = () => {
  const { adjustments, locations, createAdjustment } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      header: 'Reference',
      accessor: 'reference',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block">{row.reference}</span>
            <span className="text-[11px] text-slate-400">{formatDateTime(row.date)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Product & SKU',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">{row.productName}</span>
          <span className="text-xs font-mono text-emerald-600 font-semibold">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Location Audited',
      accessor: 'locationId',
      render: (row) => {
        const loc = locations.find(l => l.id === row.locationId);
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            {loc?.name || row.locationId}
          </span>
        );
      }
    },
    {
      header: 'Recorded vs Physical',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-500">System: {row.recordedQty} {row.uom}</span>
          <span className="mx-1.5 text-slate-300">→</span>
          <span className="font-bold text-slate-900">Floor: {row.countedQty} {row.uom}</span>
        </div>
      )
    },
    {
      header: 'Variance',
      accessor: 'variance',
      render: (row) => {
        const isLoss = row.variance < 0;
        const isSurplus = row.variance > 0;

        return (
          <span
            className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs ${
              isLoss
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isSurplus
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isLoss && <TrendingDown className="w-3.5 h-3.5" />}
            {isSurplus && <TrendingUp className="w-3.5 h-3.5" />}
            {isSurplus ? `+${row.variance}` : row.variance} {row.uom}
          </span>
        );
      }
    },
    {
      header: 'Reason & Auditor',
      accessor: 'reason',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.reason}</p>
          <span className="text-[11px] text-slate-400">By {row.adjustedBy || 'Auditor'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Stock Adjustments & Cycle Count
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve physical floor discrepancies against recorded inventory balances. Automatically writes audit adjustments to the Stock Ledger.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Cycle Count
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={adjustments}
        searchField="productName"
        searchPlaceholder="Search by Product, SKU, or Reference..."
        pageSize={8}
      />

      <AdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createAdjustment}
      />
    </div>
  );
};
