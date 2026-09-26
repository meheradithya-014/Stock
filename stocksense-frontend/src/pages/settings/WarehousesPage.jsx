import React, { useState } from 'react';
import { Warehouse, MapPin, Plus, Building2, Layers } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Modal } from '../../components/common/Modal';

export const WarehousesPage = () => {
  const { warehouses, locations, createWarehouse, createLocation } = useInventory();

  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);

  // New warehouse form state
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whCity, setWhCity] = useState('');

  // New location form state
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || 'wh-main');
  const [locType, setLocType] = useState('internal');

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!whName || !whCode) return;
    await createWarehouse({ name: whName, code: whCode, city: whCity });
    setWhName('');
    setWhCode('');
    setWhCity('');
    setIsWhModalOpen(false);
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!locName || !locCode) return;
    await createLocation({
      name: locName,
      code: locCode,
      warehouseId: locWarehouseId,
      type: locType
    });
    setLocName('');
    setLocCode('');
    setIsLocModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Warehouses & Storage Locations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-facility distribution hubs, internal racking, bays, and staging zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWhModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
          <button
            onClick={() => setIsLocModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Storage Location
          </button>
        </div>
      </div>

      {/* Warehouse Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {warehouses.map((wh) => {
          const whLocations = locations.filter(l => l.warehouseId === wh.id);

          return (
            <div
              key={wh.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{wh.code} • {wh.city}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {whLocations.length} Zones
                </span>
              </div>

              {/* Child Locations list */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mapped Zones & Racks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {whLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 block truncate">{loc.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{loc.code}</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {loc.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warehouse Modal */}
      <Modal
        isOpen={isWhModalOpen}
        onClose={() => setIsWhModalOpen(false)}
        title="Add New Warehouse Facility"
        subtitle="Register a new central hub or regional distribution facility"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              placeholder="e.g. South Texas Logistics Center"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Code *</label>
              <input
                type="text"
                required
                value={whCode}
                onChange={(e) => setWhCode(e.target.value)}
                placeholder="e.g. WH-03"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={whCity}
                onChange={(e) => setWhCity(e.target.value)}
                placeholder="e.g. Houston, TX"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWhModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Facility
            </button>
          </div>
        </form>
      </Modal>

      {/* Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Add Storage Location / Rack"
        subtitle="Define an internal storage zone, rack, or bay under an active warehouse"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Warehouse *</label>
            <select
              value={locWarehouseId}
              onChange={(e) => setLocWarehouseId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name *</label>
            <input
              type="text"
              required
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              placeholder="e.g. Mezzanine Rack C-04"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location Code *</label>
              <input
                type="text"
                required
                value={locCode}
                onChange={(e) => setLocCode(e.target.value)}
                placeholder="e.g. WH1/MEZZ-C4"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type</label>
              <select
                value={locType}
                onChange={(e) => setLocType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="internal">Internal Storage</option>
                <option value="transit">Transit / Staging</option>
                <option value="production">Production Line</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLocModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Storage Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
