import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  History,
  Warehouse,
  User,
  LogOut,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Boxes },
    {
      group: 'Operations',
      items: [
        { label: 'Receipts (In)', path: '/operations/receipts', icon: ArrowDownLeft, badge: 'In' },
        { label: 'Deliveries (Out)', path: '/operations/deliveries', icon: ArrowUpRight, badge: 'Out' },
        { label: 'Internal Transfers', path: '/operations/transfers', icon: ArrowLeftRight }
      ]
    },
    { label: 'Stock Adjustments', path: '/adjustments', icon: Sliders },
    { label: 'Move History / Ledger', path: '/ledger', icon: History },
    {
      group: 'Settings',
      items: [
        { label: 'Warehouses & Locations', path: '/settings/warehouses', icon: Warehouse }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20">
            <Package className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              StockSense
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                IMS
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Warehouse</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if (item.group) {
              return (
                <div key={idx} className="pt-3">
                  <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.group}
                  </div>
                  <div className="space-y-1">
                    {item.items.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className="w-4 h-4 opacity-80" />
                            <span>{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              {sub.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout Section (Left Navigation requirement) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Inventory Admin'}</p>
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  {user?.role || 'Staff'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <NavLink
              to="/profile"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
