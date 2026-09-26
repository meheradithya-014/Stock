import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useInventory } from '../../context/InventoryContext';

export const TransferModal = ({ isOpen, onClose, onSave }) => {
  const { products, locations, activeWarehouse } = useInventory();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [sourceLocationId, setSourceLocationId] = useState('loc-main-store');
  const [destinationLocationId, setDestinationLocationId] = useState('loc-prod-rack');
  const [qty, setQty] = useState(10);
  const [reason, setReason] = useState('Production replenishment');

  const selectedProduct = products.find(p => p.id === productId);
  const availableAtSource = selectedProduct?.locationStock?.[sourceLocationId] || 0;
  const isExceeded = Number(qty) > availableAtSource;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || isExceeded || sourceLocationId === destinationLocationId) return;

    onSave({
      productId,
      sourceLocationId,
      destinationLocationId,
      warehouseId: activeWarehouse || 'wh-main',
      qty: Number(qty),
      reason
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Internal Stock Transfer"
      subtitle="Relocate inventory between warehouse bays, racks, or production staging areas"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Source -> Destination Map */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Source Location</label>
              <select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Available: <span className="font-bold text-slate-800">{availableAtSource} {selectedProduct?.uom}</span>
              </p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400 pt-3">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Destination Location</label>
              <select
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Current: <span className="font-bold text-slate-800">{selectedProduct?.locationStock?.[destinationLocationId] || 0} {selectedProduct?.uom}</span>
              </p>
            </div>
          </div>

          {sourceLocationId === destinationLocationId && (
            <p className="text-xs text-rose-600 font-medium">Source and destination locations cannot be identical.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Quantity ({selectedProduct?.uom || 'units'}) *
            </label>
            <input
              type="number"
              min="1"
              max={availableAtSource}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                isExceeded ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300'
              }`}
            />
            {isExceeded && (
              <p className="text-[11px] text-rose-600 mt-1">Quantity exceeds available source stock.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Purpose</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Move to production rack for welding"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
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
            disabled={isExceeded || sourceLocationId === destinationLocationId}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Transfer
          </button>
        </div>
      </form>
    </Modal>
  );
};
