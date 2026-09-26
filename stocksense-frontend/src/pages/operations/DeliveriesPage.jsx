import React, { useState } from 'react';
import { Plus, CheckCircle, ArrowUpRight, CheckSquare, Square, Box, Truck } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DeliveryModal } from '../../components/operations/DeliveryModal';
import { formatDateTime } from '../../utils/formatters';
import { STATUSES } from '../../utils/constants';

export const DeliveriesPage = () => {
  const { deliveries, locations, createDelivery, updateDeliveryStep, validateDelivery } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filterOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'Ready', value: STATUSES.READY },
    { label: 'Waiting', value: STATUSES.WAITING },
    { label: 'Done', value: STATUSES.DONE }
  ];

  const handleToggleStep = async (delivery, step) => {
    if (delivery.status === STATUSES.DONE) return;
    if (step === 'picked') {
      await updateDeliveryStep(delivery.id, { picked: !delivery.picked });
    } else if (step === 'packed') {
      await updateDeliveryStep(delivery.id, { packed: !delivery.packed });
    }
  };

  const columns = [
    {
      header: 'Reference',
      accessor: 'reference',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block">{row.reference}</span>
            <span className="text-[11px] text-slate-400">{formatDateTime(row.date)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Customer & Destination',
      accessor: 'customer',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">{row.customer}</span>
          <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
            {row.shippingAddress || 'Customer Pickup'}
          </span>
          {row.carrier && (
            <span className="text-[10px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 text-slate-400" />
              {row.carrier}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Items Dispatched',
      accessor: 'items',
      render: (row) => (
        <div className="space-y-1">
          {row.items?.map((item, idx) => (
            <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
              <span className="font-semibold">{item.qty} {item.uom}</span>
              <span className="text-slate-500 truncate max-w-[160px]">{item.productName}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Pick & Pack Steps',
      render: (row) => {
        const isDone = row.status === STATUSES.DONE;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStep(row, 'picked')}
              disabled={isDone}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                row.picked
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-500 border-slate-300 hover:border-slate-400'
              }`}
            >
              {row.picked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Pick</span>
            </button>

            <button
              onClick={() => handleToggleStep(row, 'packed')}
              disabled={isDone}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                row.packed
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-50 text-slate-500 border-slate-300 hover:border-slate-400'
              }`}
            >
              {row.packed ? <Box className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Pack</span>
            </button>
          </div>
        );
      }
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
              onClick={() => validateDelivery(row.id)}
              disabled={!row.picked || !row.packed}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors ${
                row.picked && row.packed
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed text-slate-600'
              }`}
              title={!row.picked || !row.packed ? 'Must Pick and Pack before validating' : 'Validate dispatch'}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Validate (Stock -)
            </button>
          ) : (
            <span className="text-xs text-slate-400 inline-flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Dispatched
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
            Delivery Orders (Outgoing Goods)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch orders with Pick & Pack verification. Validating decrements warehouse inventory in real time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Delivery Order
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={deliveries}
        searchField="customer"
        searchPlaceholder="Search Customer, Ref, or Carrier..."
        filterOptions={filterOptions}
        activeFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
        pageSize={8}
      />

      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createDelivery}
      />
    </div>
  );
};
