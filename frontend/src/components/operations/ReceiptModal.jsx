import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useInventory } from '../../context/InventoryContext';
import { STATUSES } from '../../utils/constants';

export const ReceiptModal = ({ isOpen, onClose, onSave }) => {
  const { products, locations, activeWarehouse } = useInventory();

  const [vendor, setVendor] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('loc-receiving');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', qty: 50, unitCost: products[0]?.unitCost || 10 }
  ]);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems([
      ...items,
      { productId: firstProd ? firstProd.id : '', qty: 10, unitCost: firstProd ? firstProd.unitCost : 10 }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const nextItems = [...items];
    nextItems[index][field] = value;

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        nextItems[index].unitCost = prod.unitCost;
      }
    }
    setItems(nextItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vendor) return;

    // Enriched items
    const enrichedItems = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Item',
        sku: prod?.sku || '',
        uom: prod?.uom || 'units',
        qty: Number(item.qty),
        unitCost: Number(item.unitCost)
      };
    });

    onSave({
      vendor,
      warehouseId: activeWarehouse || 'wh-main',
      destinationLocationId,
      notes,
      status: STATUSES.READY,
      items: enrichedItems
    });

    onClose();
  };

  const totalCost = items.reduce((acc, it) => acc + (Number(it.qty) * Number(it.unitCost || 0)), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Inbound Receipt (Incoming Goods)"
      subtitle="Register shipments arriving from suppliers & vendors into warehouse locations"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Vendor Name *</label>
            <input
              type="text"
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Apex Industrial Supplies Ltd."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Shelving / Bay *</label>
            <select
              value={destinationLocationId}
              onChange={(e) => setDestinationLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Received Line Items</span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line
            </button>
          </div>

          <div className="p-3 space-y-2">
            {items.map((item, index) => {
              const prod = products.find(p => p.id === item.productId);
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50/60 p-2 rounded-lg border border-slate-200/80">
                  <div className="col-span-5">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      Qty ({prod?.uom || 'units'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center pt-3">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between text-xs text-slate-700 font-medium">
            <span>Total Valuation:</span>
            <span className="font-bold text-slate-900">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / PO Reference</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. PO-7712 / Bill of Lading BOL-9941"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
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
            Create Inbound Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};
