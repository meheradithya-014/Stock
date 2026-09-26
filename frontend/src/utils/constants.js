export const DOCUMENT_TYPES = {
  RECEIPT: 'receipt',
  DELIVERY: 'delivery',
  INTERNAL: 'internal',
  ADJUSTMENT: 'adjustment'
};

export const DOCUMENT_TYPE_LABELS = {
  receipt: 'Receipt (Incoming)',
  delivery: 'Delivery Order (Outgoing)',
  internal: 'Internal Transfer',
  adjustment: 'Stock Adjustment'
};

export const STATUSES = {
  DRAFT: 'Draft',
  WAITING: 'Waiting',
  READY: 'Ready',
  DONE: 'Done',
  CANCELED: 'Canceled'
};

export const STATUS_COLORS = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-300',
  Ready: 'bg-blue-50 text-blue-700 border-blue-300',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Canceled: 'bg-rose-50 text-rose-700 border-rose-300'
};

export const USER_ROLES = {
  MANAGER: 'Inventory Manager',
  STAFF: 'Warehouse Staff'
};

export const PRODUCT_CATEGORIES = [
  'Raw Materials',
  'Finished Goods',
  'Hardware & Fasteners',
  'Packaging',
  'Electronics & Parts',
  'Chemicals & Fluids'
];

export const UNITS_OF_MEASURE = [
  'units',
  'kg',
  'meters',
  'liters',
  'boxes',
  'pallets'
];

export const INITIAL_WAREHOUSES = [
  { id: 'wh-main', code: 'WH-01', name: 'Main Central Hub', city: 'Chicago, IL' },
  { id: 'wh-west', code: 'WH-02', name: 'West Distribution Center', city: 'Reno, NV' }
];

export const INITIAL_LOCATIONS = [
  { id: 'loc-main-store', warehouseId: 'wh-main', name: 'Main Store', code: 'WH1/STOCK', type: 'internal' },
  { id: 'loc-prod-rack', warehouseId: 'wh-main', name: 'Production Rack', code: 'WH1/PROD', type: 'internal' },
  { id: 'loc-rack-a', warehouseId: 'wh-main', name: 'Rack A (High Density)', code: 'WH1/RACK-A', type: 'internal' },
  { id: 'loc-rack-b', warehouseId: 'wh-main', name: 'Rack B (Small Parts)', code: 'WH1/RACK-B', type: 'internal' },
  { id: 'loc-receiving', warehouseId: 'wh-main', name: 'Receiving Dock', code: 'WH1/IN', type: 'transit' },
  { id: 'loc-shipping', warehouseId: 'wh-main', name: 'Shipping Bay', code: 'WH1/OUT', type: 'transit' },
  { id: 'loc-west-store', warehouseId: 'wh-west', name: 'West Main Floor', code: 'WH2/STOCK', type: 'internal' },
  { id: 'loc-west-cold', warehouseId: 'wh-west', name: 'Cold Storage Room', code: 'WH2/COLD', type: 'internal' }
];
