import React, { useState } from 'react';
import { Download, History, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

export const LedgerPage = () => {
  const { ledger } = useInventory();
  const [selectedType, setSelectedType] = useState('all');

  const filterOptions = [
    { label: 'All Movements', value: 'all' },
    { label: 'Receipts (+)', value: 'receipt' },
    { label: 'Deliveries (-)', value: 'delivery' },
    { label: 'Internal Transfers', value: 'internal' },
    { label: 'Adjustments', value: 'adjustment' }
  ];

  const handleExportCsv = () => {
    const headers = ['ID,Reference,Type,Date,Product,SKU,FromLocation,ToLocation,QuantityChange,UoM,Status,User\n'];
    const rows = ledger.map(l => 
      `"${l.id}","${l.reference}","${l.type}","${l.date}","${l.productName}","${l.sku}","${l.fromLocation}","${l.toLocation}","${l.qtyChange}","${l.uom}","${l.status}","${l.user}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockSense_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'date',
      render: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(row.date)}
        </span>
      )
    },
    {
      header: 'Reference & Type',
      accessor: 'reference',
      render: (row) => {
        const typeConfig = {
          receipt: { icon: ArrowDownLeft, color: 'text-emerald-600 bg-emerald-50', label: 'Receipt' },
          delivery: { icon: ArrowUpRight, color: 'text-blue-600 bg-blue-50', label: 'Delivery' },
          internal: { icon: ArrowLeftRight, color: 'text-indigo-600 bg-indigo-50', label: 'Transfer' },
          adjustment: { icon: SlidersHorizontal, color: 'text-amber-600 bg-amber-50', label: 'Adjustment' }
        }[row.type] || { icon: History, color: 'text-slate-600 bg-slate-50', label: row.type };

        const Icon = typeConfig.icon;

        return (
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${typeConfig.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-mono font-bold text-slate-900 block text-xs">{row.reference}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">{typeConfig.label}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Product Details',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 block text-xs">{row.productName}</span>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Movement Route (From → To)',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-500">{row.fromLocation}</span>
          <span className="mx-1 text-slate-300">→</span>
          <span className="font-semibold text-slate-800">{row.toLocation}</span>
          {row.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{row.notes}</p>}
        </div>
      )
    },
    {
      header: 'Quantity Impact',
      accessor: 'qtyChange',
      render: (row) => {
        const isPos = row.qtyChange > 0;
        const isNeg = row.qtyChange < 0;

        return (
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
              isPos
                ? 'bg-emerald-50 text-emerald-700'
                : isNeg
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isPos ? `+${row.qtyChange}` : row.qtyChange} {row.uom}
          </span>
        );
      }
    },
    {
      header: 'Executed By',
      accessor: 'user',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.user}
        </span>
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
            Move History & Stock Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable end-to-end audit trail of all warehouse receipts, deliveries, internal shifts, and count reconciliations
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={ledger}
        searchField="productName"
        searchPlaceholder="Search by Product, SKU, Ref, or Location..."
        filterOptions={filterOptions}
        activeFilter={selectedType}
        onFilterChange={setSelectedType}
        pageSize={10}
      />
    </div>
  );
};
