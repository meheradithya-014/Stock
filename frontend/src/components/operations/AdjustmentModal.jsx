import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useInventory } from '../../context/InventoryContext';

export const AdjustmentModal = ({ isOpen, onClose, onSave }) => {
  const { products, locations, activeWarehouse } = useInventory();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [locationId, setLocationId] = useState('1');
  const [recordedQty, setRecordedQty] = useState(0);
  const [countedQty, setCountedQty] = useState(0);
  const [reason, setReason] = useState('Damaged items discovered during audit');

  const selectedProduct = products.find(p => p.id === productId);

  useEffect(() => {
    if (selectedProduct && locationId) {
      const rec = selectedProduct.locationStock?.[locationId] || 0;
      setRecordedQty(rec);
      setCountedQty(rec);
    }
  }, [productId, locationId, selectedProduct]);

  const variance = Number(countedQty) - Number(recordedQty);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !locationId) return;

    onSave({
      productId,
      locationId,
      warehouseId: activeWarehouse || 'wh-main',
      recordedQty: Number(recordedQty),
      countedQty: Number(countedQty),
      reason
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Adjustment & Cycle Count"
      subtitle="Reconcile discrepancy between recorded ledger balances and physical floor counts"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse Location *</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Discrepancy Reconciliation Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Recorded Stock
              </span>
              <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                {recordedQty} <span className="text-xs font-normal text-slate-500">{selectedProduct?.uom}</span>
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Counted Quantity
              </span>
              <input
                type="number"
                min="0"
                value={countedQty}
                onChange={(e) => setCountedQty(e.target.value)}
                className="w-full text-center text-xl font-extrabold text-emerald-700 mt-1 border-b-2 border-emerald-500 focus:outline-none"
              />
            </div>

            <div className={`p-3 rounded-lg border ${
              variance === 0
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : variance > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                Variance
              </span>
              <span className="text-xl font-extrabold mt-1 block">
                {variance > 0 ? `+${variance}` : variance} <span className="text-xs font-normal">{selectedProduct?.uom}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            {variance === 0 && 'Recorded and physical counts match exactly. No inventory adjustments needed.'}
            {variance < 0 && `Discrepancy detected: ${Math.abs(variance)} ${selectedProduct?.uom} missing or damaged.`}
            {variance > 0 && `Surplus detected: +${variance} ${selectedProduct?.uom} unrecorded units found.`}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Discrepancy *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 mb-2"
          >
            <option value="Damaged items damaged during transit / shelving">Damaged items (Loss)</option>
            <option value="Shrinkage or physical inventory theft">Theft / Shrinkage (Loss)</option>
            <option value="Expired or spoiled material write-off">Expired / Spoiled (Loss)</option>
            <option value="Physical count surplus (unrecorded delivery items)">Found Unrecorded Items (Gain)</option>
            <option value="Routine monthly cycle audit count">Routine Cycle Audit Count</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
          >
            Confirm & Post Adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
};
