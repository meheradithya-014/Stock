import React, { useState } from 'react';
import { Menu, Warehouse, Bell, UserCog, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { USER_ROLES } from '../../utils/constants';

export const Topbar = ({ onMenuClick }) => {
  const { user, switchRole, activeWarehouse, setActiveWarehouse } = useAuth();
  const { stats, warehouses } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleRole = () => {
    const nextRole = user?.role === USER_ROLES.MANAGER ? USER_ROLES.STAFF : USER_ROLES.MANAGER;
    switchRole(nextRole);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Warehouse Selector */}
        <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
          <Warehouse className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-500 hidden sm:inline">Active Hub:</span>
          <select
            value={activeWarehouse}
            onChange={(e) => setActiveWarehouse(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.code} - {wh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <span className="text-[11px] text-slate-500 px-1 hidden md:inline">Role:</span>
          <button
            onClick={toggleRole}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 shadow-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            title="Click to toggle between Inventory Manager and Warehouse Staff permissions"
          >
            <UserCog className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[130px]">{user?.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {stats.lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
                <span>Inventory Alerts</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {stats.lowStockCount} Critical
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {stats.lowStockItems.length > 0 ? (
                  stats.lowStockItems.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs">
                      <div className="flex items-center justify-between font-semibold text-amber-900">
                        <span className="truncate">{item.name}</span>
                        <span className="text-[11px] font-mono">{item.currentStock} {item.uom}</span>
                      </div>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Stock level is at or below minimum threshold ({item.minReorderLevel} {item.uom})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No pending critical inventory alerts.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
