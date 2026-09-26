import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { PRODUCT_CATEGORIES, UNITS_OF_MEASURE } from '../../utils/constants';
import { useInventory } from '../../context/InventoryContext';

export const ProductModal = ({ isOpen, onClose, product = null, onSave }) => {
  const { locations } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: PRODUCT_CATEGORIES[0],
    uom: UNITS_OF_MEASURE[0],
    unitCost: 0,
    unitPrice: 0,
    minReorderLevel: 20,
    maxLevel: 200,
    initialStock: 0,
    locationStock: {}
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || PRODUCT_CATEGORIES[0],
        uom: product.uom || UNITS_OF_MEASURE[0],
        unitCost: product.unitCost || 0,
        unitPrice: product.unitPrice || 0,
        minReorderLevel: product.minReorderLevel || 20,
        maxLevel: product.maxLevel || 200,
        initialStock: product.currentStock || 0,
        locationStock: product.locationStock || {}
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: PRODUCT_CATEGORIES[0],
        uom: UNITS_OF_MEASURE[0],
        unitCost: 10,
        unitPrice: 18,
        minReorderLevel: 20,
        maxLevel: 200,
        initialStock: 50,
        locationStock: { 'loc-main-store': 50 }
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Create New Product'}
      subtitle="Configure item master details, stock reorder thresholds, and pricing"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Stainless Steel Fastener Bolt M8"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Item Code *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UoM) *</label>
            <select
              value={formData.uom}
              onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {UNITS_OF_MEASURE.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {!product && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Opening Stock</label>
              <input
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    initialStock: val,
                    locationStock: { 'loc-main-store': val }
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Reorder Threshold</label>
            <input
              type="number"
              min="0"
              value={formData.minReorderLevel}
              onChange={(e) => setFormData({ ...formData, minReorderLevel: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Stock Capacity</label>
            <input
              type="number"
              min="0"
              value={formData.maxLevel}
              onChange={(e) => setFormData({ ...formData, maxLevel: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Cost Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Selling Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Location Breakdown if editing */}
        {product && product.locationStock && (
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Stock Availability Per Location
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {Object.entries(product.locationStock).map(([locId, qty]) => {
                const loc = locations.find(l => l.id === locId);
                return (
                  <div key={locId} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-600 font-medium">{loc?.name || locId}</span>
                    <span className="font-mono font-bold text-slate-800">{qty} {product.uom}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
