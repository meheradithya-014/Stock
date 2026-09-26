import React, { useState } from 'react';
import { Plus, CheckCircle, ArrowDownLeft, Calendar, Building, Package } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptModal } from '../../components/operations/ReceiptModal';
import { formatDateTime } from '../../utils/formatters';
import { STATUSES } from '../../utils/constants';

export const ReceiptsPage = () => {
  const { receipts, locations, createReceipt, validateReceipt } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filterOptions = [
    { label: 'All Receipts', value: 'all' },
    { label: 'Ready', value: STATUSES.READY },
    { label: 'Waiting', value: STATUSES.WAITING },
    { label: 'Done', value: STATUSES.DONE }
  ];

  const columns = [
    {
      header: 'Reference',
      accessor: 'reference',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block">{row.reference}</span>
            <span className="text-[11px] text-slate-400">{formatDateTime(row.date)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Supplier / Vendor',
      accessor: 'vendor',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.vendor}</span>
          {row.notes && <span className="text-[11px] text-slate-400">{row.notes}</span>}
        </div>
      )
    },
    {
      header: 'Destination Bay',
      accessor: 'destinationLocationId',
      render: (row) => {
        const loc = locations.find(l => l.id === row.destinationLocationId);
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            {loc?.name || row.destinationLocationId}
          </span>
        );
      }
    },
    {
      header: 'Line Items',
      accessor: 'items',
      render: (row) => (
        <div className="space-y-1">
          {row.items?.map((item, idx) => (
            <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
              <span className="font-semibold">{item.qty} {item.uom}</span>
              <span className="text-slate-500 truncate max-w-[180px]">{item.productName}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Validation',
      render: (row) => (
        <div>
          {row.status !== STATUSES.DONE && row.status !== STATUSES.CANCELED ? (
            <button
              onClick={() => validateReceipt(row.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Validate (Stock +)
            </button>
          ) : (
            <span className="text-xs text-slate-400 inline-flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Stock Updated
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
            Receipts (Incoming Goods)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register arriving supplier consignments. Validating increments warehouse stock balances automatically.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Inbound Receipt
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={receipts}
        searchField="vendor"
        searchPlaceholder="Search by Supplier or Ref..."
        filterOptions={filterOptions}
        activeFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
        pageSize={8}
      />

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createReceipt}
      />
    </div>
  );
};
