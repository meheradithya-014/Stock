import React, { useState } from 'react';
import { Plus, CheckCircle, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TransferModal } from '../../components/operations/TransferModal';
import { formatDateTime } from '../../utils/formatters';
import { STATUSES } from '../../utils/constants';

export const TransfersPage = () => {
  const { transfers, locations, createTransfer, validateTransfer } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filterOptions = [
    { label: 'All Transfers', value: 'all' },
    { label: 'Ready', value: STATUSES.READY },
    { label: 'Done', value: STATUSES.DONE }
  ];

  const columns = [
    {
      header: 'Reference',
      accessor: 'reference',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block">{row.reference}</span>
            <span className="text-[11px] text-slate-400">{formatDateTime(row.date)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Product Transferred',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">{row.productName}</span>
          <span className="text-xs font-mono text-emerald-600 font-semibold">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Location Movement',
      render: (row) => {
        const src = locations.find(l => l.id === row.sourceLocationId);
        const dst = locations.find(l => l.id === row.destinationLocationId);
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
              {src?.name || row.sourceLocationId}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
              {dst?.name || row.destinationLocationId}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Quantity',
      accessor: 'qty',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 text-sm">
          {row.qty} {row.uom}
        </span>
      )
    },
    {
      header: 'Purpose / Note',
      accessor: 'reason',
      render: (row) => (
        <span className="text-xs text-slate-500 italic">
          {row.reason || 'Floor transfer'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      render: (row) => (
        <div>
          {row.status !== STATUSES.DONE && row.status !== STATUSES.CANCELED ? (
            <button
              onClick={() => validateTransfer(row.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Validate Transfer
            </button>
          ) : (
            <span className="text-xs text-slate-400 inline-flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Completed
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Internal Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Relocate materials between warehouse racks, bays, and production lines. Total inventory balance remains constant while location levels update.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Transfer
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={transfers}
        searchField="productName"
        searchPlaceholder="Search Product, SKU, or Ref..."
        filterOptions={filterOptions}
        activeFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
        pageSize={8}
      />

      <TransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createTransfer}
      />
    </div>
  );
};
