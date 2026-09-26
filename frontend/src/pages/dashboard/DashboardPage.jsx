import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Filter,
  Warehouse as WarehouseIcon
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AlphaVantageTicker } from '../../components/common/AlphaVantageTicker';
import { ReceiptModal } from '../../components/operations/ReceiptModal';
import { DeliveryModal } from '../../components/operations/DeliveryModal';
import { TransferModal } from '../../components/operations/TransferModal';
import { AdjustmentModal } from '../../components/operations/AdjustmentModal';
import { formatDateTime } from '../../utils/formatters';
import { PRODUCT_CATEGORIES, STATUSES } from '../../utils/constants';

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    warehouses,
    locations,
    stats,
    createReceipt,
    validateReceipt,
    createDelivery,
    validateDelivery,
    createTransfer,
    validateTransfer,
    createAdjustment
  } = useInventory();

  // Dynamic filter state
  const [filterDocType, setFilterDocType] = useState('all'); // all | receipts | deliveries | transfers | adjustments
  const [filterStatus, setFilterStatus] = useState('all'); // all | Draft | Waiting | Ready | Done | Canceled
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal open states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Consolidated operations stream for dynamic filtering
  const allOperations = useMemo(() => {
    const list = [];

    // Receipts
    receipts.forEach((r) => {
      list.push({
        id: r.id,
        reference: r.reference,
        docType: 'receipt',
        typeLabel: 'Receipt (Incoming)',
        party: r.vendor,
        warehouseId: r.warehouseId,
        date: r.date,
        status: r.status,
        itemCount: r.items?.length || 0,
        raw: r
      });
    });

    // Deliveries
    deliveries.forEach((d) => {
      list.push({
        id: d.id,
        reference: d.reference,
        docType: 'delivery',
        typeLabel: 'Delivery (Outgoing)',
        party: d.customer,
        warehouseId: d.warehouseId,
        date: d.date,
        status: d.status,
        itemCount: d.items?.length || 0,
        raw: d
      });
    });

    // Transfers
    transfers.forEach((t) => {
      list.push({
        id: t.id,
        reference: t.reference,
        docType: 'transfer',
        typeLabel: 'Internal Transfer',
        party: `${t.productName} (${t.qty} ${t.uom})`,
        warehouseId: t.warehouseId,
        date: t.date,
        status: t.status,
        itemCount: 1,
        raw: t
      });
    });

    // Adjustments
    adjustments.forEach((a) => {
      list.push({
        id: a.id,
        reference: a.reference,
        docType: 'adjustment',
        typeLabel: 'Stock Adjustment',
        party: `${a.productName} (Variance: ${a.variance > 0 ? '+' : ''}${a.variance} ${a.uom})`,
        warehouseId: a.warehouseId,
        date: a.date,
        status: a.status,
        itemCount: 1,
        raw: a
      });
    });

    // Sort descending by date
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply Dynamic Filters
    return list.filter((op) => {
      if (filterDocType !== 'all') {
        if (filterDocType === 'receipts' && op.docType !== 'receipt') return false;
        if (filterDocType === 'deliveries' && op.docType !== 'delivery') return false;
        if (filterDocType === 'transfers' && op.docType !== 'transfer') return false;
        if (filterDocType === 'adjustments' && op.docType !== 'adjustment') return false;
      }

      if (filterStatus !== 'all' && op.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      if (filterWarehouse !== 'all' && op.warehouseId !== filterWarehouse) {
        return false;
      }

      if (filterCategory !== 'all') {
        // Check if items match category
        let hasCategory = false;
        if (op.raw.items) {
          hasCategory = op.raw.items.some((item) => {
            const p = products.find((pr) => pr.id === item.productId);
            return p?.category === filterCategory;
          });
        } else if (op.raw.productId) {
          const p = products.find((pr) => pr.id === op.raw.productId);
          hasCategory = p?.category === filterCategory;
        }
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [receipts, deliveries, transfers, adjustments, products, filterDocType, filterStatus, filterWarehouse, filterCategory]);

  const handleValidateOperation = async (op) => {
    if (op.docType === 'receipt') {
      await validateReceipt(op.id);
    } else if (op.docType === 'delivery') {
      await validateDelivery(op.id);
    } else if (op.docType === 'transfer') {
      await validateTransfer(op.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-warehouse operations snapshot, asset valuation, and pending dispatches
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Receipt
          </button>
          <button
            onClick={() => setIsDeliveryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Delivery
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Internal Transfer
          </button>
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Cycle Count
          </button>
        </div>
      </div>

      {/* Alpha Vantage Commodity Intelligence & Market Asset Valuation */}
      <AlphaVantageTicker />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Products in Stock"
          value={stats.totalProducts}
          subtitle={`${stats.totalUnits.toLocaleString()} units on hand`}
          icon={Boxes}
          color="emerald"
          trend="+4.2% mo/mo"
          onClick={() => { setFilterDocType('all'); setFilterStatus('all'); }}
        />
        <KpiCard
          title="Low Stock / Out of Stock"
          value={stats.lowStockCount + stats.outOfStockCount}
          subtitle={`${stats.outOfStockCount} depleted, ${stats.lowStockCount} reorder alert`}
          icon={AlertTriangle}
          color={stats.lowStockCount > 0 ? 'rose' : 'emerald'}
          trend={stats.lowStockCount > 0 ? 'Action Needed' : 'Nominal'}
          onClick={() => setFilterStatus(STATUSES.WAITING)}
        />
        <KpiCard
          title="Pending Receipts"
          value={stats.pendingReceipts}
          subtitle="Incoming vendor POs"
          icon={ArrowDownLeft}
          color="amber"
          active={filterDocType === 'receipts'}
          onClick={() => setFilterDocType('receipts')}
        />
        <KpiCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          subtitle="Customer shipments in queue"
          icon={ArrowUpRight}
          color="blue"
          active={filterDocType === 'deliveries'}
          onClick={() => setFilterDocType('deliveries')}
        />
        <KpiCard
          title="Internal Transfers"
          value={stats.internalTransfersScheduled}
          subtitle="Rack & staging relocations"
          icon={ArrowLeftRight}
          color="indigo"
          active={filterDocType === 'transfers'}
          onClick={() => setFilterDocType('transfers')}
        />
      </div>

      {/* Dynamic Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Dynamic Operations Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Document Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Document Type
            </label>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Document Types</option>
              <option value="receipts">Receipts (Incoming)</option>
              <option value="deliveries">Deliveries (Outgoing)</option>
              <option value="transfers">Internal Transfers</option>
              <option value="adjustments">Stock Adjustments</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status Flow
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value={STATUSES.DRAFT}>Draft</option>
              <option value={STATUSES.WAITING}>Waiting</option>
              <option value={STATUSES.READY}>Ready</option>
              <option value={STATUSES.DONE}>Done</option>
              <option value={STATUSES.CANCELED}>Canceled</option>
            </select>
          </div>

          {/* Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Warehouse / Hub
            </label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>
              ))}
            </select>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Product Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset filter pill if active */}
        {(filterDocType !== 'all' || filterStatus !== 'all' || filterWarehouse !== 'all' || filterCategory !== 'all') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setFilterDocType('all');
                setFilterStatus('all');
                setFilterWarehouse('all');
                setFilterCategory('all');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Filtered Operations Stream */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Warehouse Operations Stream</h2>
            <p className="text-xs text-slate-500">Live operational ledger reflecting active movements and validate actions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {allOperations.length} records matching
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Party / Item Summary</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allOperations.length > 0 ? (
                allOperations.slice(0, 8).map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-slate-900">
                      {op.reference}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-slate-700">{op.typeLabel}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-800 font-medium">
                      {op.party}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(op.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={op.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {op.status !== STATUSES.DONE && op.status !== STATUSES.CANCELED ? (
                        <button
                          onClick={() => handleValidateOperation(op)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Validate
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                    No operations match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSave={createReceipt}
      />
      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSave={createDelivery}
      />
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={createTransfer}
      />
      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSave={createAdjustment}
      />
    </div>
  );
};
