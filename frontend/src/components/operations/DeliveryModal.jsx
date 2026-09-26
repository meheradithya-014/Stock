import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useInventory } from '../../context/InventoryContext';

export const DeliveryModal = ({ isOpen, onClose, onSave }) => {
  const { products, locations, activeWarehouse } = useInventory();

  const [customer, setCustomer] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('loc-main-store');
  const [carrier, setCarrier] = useState('UPS Express Freight');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', qty: 5 }
  ]);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems([
      ...items,
      { productId: firstProd ? firstProd.id : '', qty: 1 }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const nextItems = [...items];
    nextItems[index][field] = value;
    setItems(nextItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

    const enrichedItems = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Item',
        sku: prod?.sku || '',
        uom: prod?.uom || 'units',
        qty: Number(item.qty)
      };
    });

    onSave({
      customer,
      shippingAddress,
      carrier,
      warehouseId: activeWarehouse || 'wh-main',
      sourceLocationId,
      items: enrichedItems
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Outbound Delivery Order (Sales Shipment)"
      subtitle="Dispatch reserved inventory items to customers or distribution hubs"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Client Name *</label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Apex Industrial Solutions Inc."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Carrier</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. FedEx / DHL / LTL Carrier"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Source Dispatch Location *</label>
            <select
              value={sourceLocationId}
              onChange={(e) => setSourceLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Shipping Address</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="e.g. 100 Corporate Parkway, Suite 400"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Requested Line Items</span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Outgoing Item
            </button>
          </div>

          <div className="p-3 space-y-2">
            {items.map((item, index) => {
              const prod = products.find(p => p.id === item.productId);
              const availableInLoc = prod?.locationStock?.[sourceLocationId] || 0;
              const hasShortage = Number(item.qty) > availableInLoc;

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50/60 p-2 rounded-lg border border-slate-200/80">
                  <div className="col-span-7">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Total: {p.currentStock} {p.uom})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="block text-[10px] text-slate-500 font-semibold">
                        Qty ({prod?.uom || 'units'})
                      </label>
                      <span className={`text-[10px] ${hasShortage ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        Avail: {availableInLoc}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border rounded bg-white ${
                        hasShortage ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-300'
                      }`}
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
            Create Delivery Order
          </button>
        </div>
      </form>
    </Modal>
  );
};
