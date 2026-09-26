import { INITIAL_WAREHOUSES, INITIAL_LOCATIONS, STATUSES } from '../utils/constants';

const DB_STORAGE_KEY = 'stocksense_db_v1';

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    sku: 'RAW-STL-001',
    name: 'Industrial Steel Rods (10mm)',
    category: 'Raw Materials',
    uom: 'kg',
    unitCost: 14.50,
    unitPrice: 22.00,
    minReorderLevel: 150,
    maxLevel: 1000,
    locationStock: {
      'loc-main-store': 280,
      'loc-prod-rack': 80,
      'loc-rack-a': 40
    }
  },
  {
    id: 'prod-2',
    sku: 'FNG-CHR-082',
    name: 'Ergonomic Executive Office Chair',
    category: 'Finished Goods',
    uom: 'units',
    unitCost: 65.00,
    unitPrice: 129.99,
    minReorderLevel: 25,
    maxLevel: 200,
    locationStock: {
      'loc-main-store': 18,
      'loc-rack-b': 14
    }
  },
  {
    id: 'prod-3',
    sku: 'HDW-BLT-500',
    name: 'Hex Flange Bolts M10 Zinc-Plated',
    category: 'Hardware & Fasteners',
    uom: 'boxes',
    unitCost: 8.20,
    unitPrice: 14.00,
    minReorderLevel: 80,
    maxLevel: 500,
    locationStock: {
      'loc-main-store': 65,
      'loc-rack-a': 120
    }
  },
  {
    id: 'prod-4',
    sku: 'PKG-BOX-404',
    name: 'Corrugated Shipping Box 40x40x30cm',
    category: 'Packaging',
    uom: 'boxes',
    unitCost: 1.15,
    unitPrice: 2.50,
    minReorderLevel: 300,
    maxLevel: 2000,
    locationStock: {
      'loc-main-store': 210,
      'loc-shipping': 40
    }
  },
  {
    id: 'prod-5',
    sku: 'ELC-BAT-24V',
    name: 'Lithium-Ion Battery Pack 24V 10Ah',
    category: 'Electronics & Parts',
    uom: 'units',
    unitCost: 88.00,
    unitPrice: 165.00,
    minReorderLevel: 15,
    maxLevel: 100,
    locationStock: {
      'loc-main-store': 6,
      'loc-rack-b': 8
    }
  },
  {
    id: 'prod-6',
    sku: 'CHM-LUB-500',
    name: 'Synthetic Machine Lubricant Grade 46',
    category: 'Chemicals & Fluids',
    uom: 'liters',
    unitCost: 12.00,
    unitPrice: 19.50,
    minReorderLevel: 50,
    maxLevel: 300,
    locationStock: {
      'loc-main-store': 42
    }
  }
];

// Calculate currentStock as sum of location stocks
INITIAL_PRODUCTS.forEach(p => {
  p.currentStock = Object.values(p.locationStock || {}).reduce((a, b) => a + b, 0);
});

const INITIAL_RECEIPTS = [
  {
    id: 'rec-1',
    reference: 'REC-2026-001',
    warehouseId: 'wh-main',
    destinationLocationId: 'loc-receiving',
    vendor: 'Apex Global Metals Inc.',
    date: '2026-09-24T14:30:00Z',
    status: STATUSES.DONE,
    notes: 'PO-8823 delivered via Freight',
    items: [
      { productId: 'prod-1', productName: 'Industrial Steel Rods (10mm)', sku: 'RAW-STL-001', qty: 100, uom: 'kg', unitCost: 14.50 }
    ]
  },
  {
    id: 'rec-2',
    reference: 'REC-2026-002',
    warehouseId: 'wh-main',
    destinationLocationId: 'loc-main-store',
    vendor: 'Nordic Packaging Solutions',
    date: '2026-09-26T09:15:00Z',
    status: STATUSES.READY,
    notes: 'Q3 Restock pallets arrived at bay 4',
    items: [
      { productId: 'prod-4', productName: 'Corrugated Shipping Box 40x40x30cm', sku: 'PKG-BOX-404', qty: 500, uom: 'boxes', unitCost: 1.15 }
    ]
  },
  {
    id: 'rec-3',
    reference: 'REC-2026-003',
    warehouseId: 'wh-main',
    destinationLocationId: 'loc-main-store',
    vendor: 'ElectroCell Power Corp',
    date: '2026-09-27T11:00:00Z',
    status: STATUSES.WAITING,
    notes: 'Awaiting customs clearance invoice',
    items: [
      { productId: 'prod-5', productName: 'Lithium-Ion Battery Pack 24V 10Ah', sku: 'ELC-BAT-24V', qty: 50, uom: 'units', unitCost: 88.00 }
    ]
  }
];

const INITIAL_DELIVERIES = [
  {
    id: 'del-1',
    reference: 'DEL-2026-001',
    warehouseId: 'wh-main',
    sourceLocationId: 'loc-main-store',
    customer: 'Vanguard Workspace Solutions',
    shippingAddress: '400 Michigan Ave, Chicago, IL',
    date: '2026-09-25T11:00:00Z',
    status: STATUSES.DONE,
    picked: true,
    packed: true,
    carrier: 'FedEx Freight #FX-9921',
    items: [
      { productId: 'prod-2', productName: 'Ergonomic Executive Office Chair', sku: 'FNG-CHR-082', qty: 10, uom: 'units' }
    ]
  },
  {
    id: 'del-2',
    reference: 'DEL-2026-002',
    warehouseId: 'wh-main',
    sourceLocationId: 'loc-main-store',
    customer: 'Metro Fabrication Works',
    shippingAddress: '120 Industrial Parkway, Joliet, IL',
    date: '2026-09-26T10:00:00Z',
    status: STATUSES.READY,
    picked: true,
    packed: false,
    carrier: 'DHL Express',
    items: [
      { productId: 'prod-1', productName: 'Industrial Steel Rods (10mm)', sku: 'RAW-STL-001', qty: 20, uom: 'kg' },
      { productId: 'prod-3', productName: 'Hex Flange Bolts M10 Zinc-Plated', sku: 'HDW-BLT-500', qty: 15, uom: 'boxes' }
    ]
  },
  {
    id: 'del-3',
    reference: 'DEL-2026-003',
    warehouseId: 'wh-main',
    sourceLocationId: 'loc-main-store',
    customer: 'Apex Logistics Hub',
    shippingAddress: '55 Warehouse Way, Gary, IN',
    date: '2026-09-26T15:30:00Z',
    status: STATUSES.WAITING,
    picked: false,
    packed: false,
    carrier: 'UPS Ground',
    items: [
      { productId: 'prod-5', productName: 'Lithium-Ion Battery Pack 24V 10Ah', sku: 'ELC-BAT-24V', qty: 4, uom: 'units' }
    ]
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'trf-1',
    reference: 'TRF-2026-001',
    warehouseId: 'wh-main',
    sourceLocationId: 'loc-main-store',
    destinationLocationId: 'loc-prod-rack',
    productId: 'prod-1',
    productName: 'Industrial Steel Rods (10mm)',
    sku: 'RAW-STL-001',
    qty: 50,
    uom: 'kg',
    date: '2026-09-25T16:00:00Z',
    status: STATUSES.DONE,
    reason: 'Replenish assembly line welding cell 2'
  },
  {
    id: 'trf-2',
    reference: 'TRF-2026-002',
    warehouseId: 'wh-main',
    sourceLocationId: 'loc-main-store',
    destinationLocationId: 'loc-rack-a',
    productId: 'prod-3',
    productName: 'Hex Flange Bolts M10 Zinc-Plated',
    sku: 'HDW-BLT-500',
    qty: 30,
    uom: 'boxes',
    date: '2026-09-26T13:00:00Z',
    status: STATUSES.READY,
    reason: 'High-density shelving reorganization'
  }
];

const INITIAL_ADJUSTMENTS = [
  {
    id: 'adj-1',
    reference: 'ADJ-2026-001',
    warehouseId: 'wh-main',
    locationId: 'loc-main-store',
    productId: 'prod-1',
    productName: 'Industrial Steel Rods (10mm)',
    sku: 'RAW-STL-001',
    recordedQty: 283,
    countedQty: 280,
    variance: -3,
    uom: 'kg',
    reason: 'Damaged steel rod bent during forklift transit',
    date: '2026-09-25T18:00:00Z',
    status: STATUSES.DONE,
    adjustedBy: 'Marcus Brody (Staff)'
  }
];

const INITIAL_LEDGER = [
  {
    id: 'led-1',
    reference: 'REC-2026-001',
    type: 'receipt',
    date: '2026-09-24T14:30:00Z',
    productId: 'prod-1',
    productName: 'Industrial Steel Rods (10mm)',
    sku: 'RAW-STL-001',
    fromLocation: 'Vendor: Apex Metals',
    toLocation: 'Receiving Dock',
    qtyChange: +100,
    uom: 'kg',
    status: STATUSES.DONE,
    user: 'Sarah Jenkins (Manager)'
  },
  {
    id: 'led-2',
    reference: 'TRF-2026-001',
    type: 'internal',
    date: '2026-09-25T16:00:00Z',
    productId: 'prod-1',
    productName: 'Industrial Steel Rods (10mm)',
    sku: 'RAW-STL-001',
    fromLocation: 'Main Store',
    toLocation: 'Production Rack',
    qtyChange: 0, // net total is 0, internal movement
    notes: 'Moved 50 kg from Main Store -> Production Rack',
    uom: 'kg',
    status: STATUSES.DONE,
    user: 'Marcus Brody (Staff)'
  },
  {
    id: 'led-3',
    reference: 'DEL-2026-001',
    type: 'delivery',
    date: '2026-09-25T11:00:00Z',
    productId: 'prod-2',
    productName: 'Ergonomic Executive Office Chair',
    sku: 'FNG-CHR-082',
    fromLocation: 'Main Store',
    toLocation: 'Customer: Vanguard',
    qtyChange: -10,
    uom: 'units',
    status: STATUSES.DONE,
    user: 'Sarah Jenkins (Manager)'
  },
  {
    id: 'led-4',
    reference: 'ADJ-2026-001',
    type: 'adjustment',
    date: '2026-09-25T18:00:00Z',
    productId: 'prod-1',
    productName: 'Industrial Steel Rods (10mm)',
    sku: 'RAW-STL-001',
    fromLocation: 'Main Store',
    toLocation: 'Adjustment (Loss)',
    qtyChange: -3,
    uom: 'kg',
    status: STATUSES.DONE,
    user: 'Marcus Brody (Staff)'
  }
];

class MockDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      console.warn('Could not read from localStorage, using initial mock data');
    }
    return {
      products: INITIAL_PRODUCTS,
      receipts: INITIAL_RECEIPTS,
      deliveries: INITIAL_DELIVERIES,
      transfers: INITIAL_TRANSFERS,
      adjustments: INITIAL_ADJUSTMENTS,
      ledger: INITIAL_LEDGER,
      warehouses: INITIAL_WAREHOUSES,
      locations: INITIAL_LOCATIONS
    };
  }

  save() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      console.warn('Could not save to localStorage');
    }
  }

  reset() {
    localStorage.removeItem(DB_STORAGE_KEY);
    this.data = this.load();
    return this.data;
  }

  // --- Products ---
  getProducts() {
    return [...this.data.products];
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(productData) {
    const id = `prod-${Date.now()}`;
    const initialLocationStock = productData.locationStock || { 'loc-main-store': Number(productData.initialStock || 0) };
    const currentStock = Object.values(initialLocationStock).reduce((a, b) => a + Number(b), 0);

    const newProd = {
      ...productData,
      id,
      currentStock,
      locationStock: initialLocationStock,
      minReorderLevel: Number(productData.minReorderLevel || 10),
      maxLevel: Number(productData.maxLevel || 100),
      unitCost: Number(productData.unitCost || 0),
      unitPrice: Number(productData.unitPrice || 0)
    };

    this.data.products.unshift(newProd);

    if (currentStock > 0) {
      this.data.ledger.unshift({
        id: `led-${Date.now()}`,
        reference: 'INIT-STOCK',
        type: 'receipt',
        date: new Date().toISOString(),
        productId: newProd.id,
        productName: newProd.name,
        sku: newProd.sku,
        fromLocation: 'Initial Balance',
        toLocation: 'Main Store',
        qtyChange: currentStock,
        uom: newProd.uom,
        status: STATUSES.DONE,
        user: 'System Admin'
      });
    }

    this.save();
    return newProd;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    // Recalculate total
    if (updates.locationStock) {
      this.data.products[idx].currentStock = Object.values(updates.locationStock).reduce((a, b) => a + Number(b), 0);
    }
    this.save();
    return this.data.products[idx];
  }

  // --- Receipts (Incoming Goods) ---
  getReceipts() {
    return [...this.data.receipts];
  }

  createReceipt(receiptData) {
    const id = `rec-${Date.now()}`;
    const reference = `REC-2026-${String(this.data.receipts.length + 1).padStart(3, '0')}`;
    const newReceipt = {
      ...receiptData,
      id,
      reference,
      date: receiptData.date || new Date().toISOString(),
      status: receiptData.status || STATUSES.DRAFT
    };
    this.data.receipts.unshift(newReceipt);
    this.save();
    return newReceipt;
  }

  validateReceipt(id, user = 'Current User') {
    const receipt = this.data.receipts.find(r => r.id === id);
    if (!receipt || receipt.status === STATUSES.DONE) return receipt;

    receipt.status = STATUSES.DONE;
    const destLoc = receipt.destinationLocationId || 'loc-main-store';

    // Increase stock for each item
    receipt.items.forEach(item => {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.locationStock = prod.locationStock || {};
        prod.locationStock[destLoc] = (prod.locationStock[destLoc] || 0) + Number(item.qty);
        prod.currentStock = Object.values(prod.locationStock).reduce((a, b) => a + Number(b), 0);

        // Append to ledger
        this.data.ledger.unshift({
          id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          reference: receipt.reference,
          type: 'receipt',
          date: new Date().toISOString(),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          fromLocation: `Vendor: ${receipt.vendor}`,
          toLocation: this.getLocationName(destLoc),
          qtyChange: +Number(item.qty),
          uom: prod.uom,
          status: STATUSES.DONE,
          user
        });
      }
    });

    this.save();
    return receipt;
  }

  // --- Deliveries (Outgoing Goods) ---
  getDeliveries() {
    return [...this.data.deliveries];
  }

  createDelivery(deliveryData) {
    const id = `del-${Date.now()}`;
    const reference = `DEL-2026-${String(this.data.deliveries.length + 1).padStart(3, '0')}`;
    const newDelivery = {
      ...deliveryData,
      id,
      reference,
      date: deliveryData.date || new Date().toISOString(),
      status: STATUSES.DRAFT,
      picked: false,
      packed: false
    };
    this.data.deliveries.unshift(newDelivery);
    this.save();
    return newDelivery;
  }

  updateDeliveryStep(id, { picked, packed }) {
    const del = this.data.deliveries.find(d => d.id === id);
    if (!del) return null;
    if (typeof picked === 'boolean') del.picked = picked;
    if (typeof packed === 'boolean') del.packed = packed;
    if (del.picked && del.packed && del.status === STATUSES.DRAFT) {
      del.status = STATUSES.READY;
    }
    this.save();
    return del;
  }

  validateDelivery(id, user = 'Current User') {
    const del = this.data.deliveries.find(d => d.id === id);
    if (!del || del.status === STATUSES.DONE) return del;

    del.status = STATUSES.DONE;
    del.picked = true;
    del.packed = true;
    const srcLoc = del.sourceLocationId || 'loc-main-store';

    // Decrease stock for each item
    del.items.forEach(item => {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.locationStock = prod.locationStock || {};
        const currentLocStock = prod.locationStock[srcLoc] || 0;
        prod.locationStock[srcLoc] = Math.max(0, currentLocStock - Number(item.qty));
        prod.currentStock = Object.values(prod.locationStock).reduce((a, b) => a + Number(b), 0);

        // Append to ledger
        this.data.ledger.unshift({
          id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          reference: del.reference,
          type: 'delivery',
          date: new Date().toISOString(),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          fromLocation: this.getLocationName(srcLoc),
          toLocation: `Customer: ${del.customer}`,
          qtyChange: -Number(item.qty),
          uom: prod.uom,
          status: STATUSES.DONE,
          user
        });
      }
    });

    this.save();
    return del;
  }

  // --- Internal Transfers ---
  getTransfers() {
    return [...this.data.transfers];
  }

  createTransfer(transferData) {
    const id = `trf-${Date.now()}`;
    const reference = `TRF-2026-${String(this.data.transfers.length + 1).padStart(3, '0')}`;
    const prod = this.data.products.find(p => p.id === transferData.productId);
    const newTransfer = {
      ...transferData,
      id,
      reference,
      productName: prod?.name || '',
      sku: prod?.sku || '',
      uom: prod?.uom || 'units',
      date: transferData.date || new Date().toISOString(),
      status: STATUSES.READY
    };
    this.data.transfers.unshift(newTransfer);
    this.save();
    return newTransfer;
  }

  validateTransfer(id, user = 'Current User') {
    const trf = this.data.transfers.find(t => t.id === id);
    if (!trf || trf.status === STATUSES.DONE) return trf;

    trf.status = STATUSES.DONE;
    const prod = this.data.products.find(p => p.id === trf.productId);
    if (prod) {
      prod.locationStock = prod.locationStock || {};
      const srcStock = prod.locationStock[trf.sourceLocationId] || 0;
      prod.locationStock[trf.sourceLocationId] = Math.max(0, srcStock - Number(trf.qty));
      prod.locationStock[trf.destinationLocationId] = (prod.locationStock[trf.destinationLocationId] || 0) + Number(trf.qty);
      prod.currentStock = Object.values(prod.locationStock).reduce((a, b) => a + Number(b), 0);

      this.data.ledger.unshift({
        id: `led-${Date.now()}`,
        reference: trf.reference,
        type: 'internal',
        date: new Date().toISOString(),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        fromLocation: this.getLocationName(trf.sourceLocationId),
        toLocation: this.getLocationName(trf.destinationLocationId),
        qtyChange: 0,
        notes: `Moved ${trf.qty} ${prod.uom} between racks`,
        uom: prod.uom,
        status: STATUSES.DONE,
        user
      });
    }

    this.save();
    return trf;
  }

  // --- Stock Adjustments (Physical count reconciliation) ---
  getAdjustments() {
    return [...this.data.adjustments];
  }

  createAdjustment(adjData, user = 'Current User') {
    const id = `adj-${Date.now()}`;
    const reference = `ADJ-2026-${String(this.data.adjustments.length + 1).padStart(3, '0')}`;
    const prod = this.data.products.find(p => p.id === adjData.productId);
    const variance = Number(adjData.countedQty) - Number(adjData.recordedQty);

    const newAdj = {
      ...adjData,
      id,
      reference,
      productName: prod?.name || '',
      sku: prod?.sku || '',
      uom: prod?.uom || 'units',
      variance,
      date: new Date().toISOString(),
      status: STATUSES.DONE,
      adjustedBy: user
    };

    // Apply adjustment immediately upon submission
    if (prod) {
      prod.locationStock = prod.locationStock || {};
      prod.locationStock[adjData.locationId] = Number(adjData.countedQty);
      prod.currentStock = Object.values(prod.locationStock).reduce((a, b) => a + Number(b), 0);

      this.data.ledger.unshift({
        id: `led-${Date.now()}`,
        reference,
        type: 'adjustment',
        date: new Date().toISOString(),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        fromLocation: this.getLocationName(adjData.locationId),
        toLocation: variance < 0 ? `Shrinkage/Damage (${adjData.reason})` : `Found Surplus (${adjData.reason})`,
        qtyChange: variance,
        uom: prod.uom,
        status: STATUSES.DONE,
        user
      });
    }

    this.data.adjustments.unshift(newAdj);
    this.save();
    return newAdj;
  }

  // --- Stock Ledger ---
  getLedger() {
    return [...this.data.ledger];
  }

  // --- Warehouses & Locations ---
  getWarehouses() {
    return [...this.data.warehouses];
  }

  getLocations() {
    return [...this.data.locations];
  }

  createWarehouse(whData) {
    const newWh = { ...whData, id: `wh-${Date.now()}` };
    this.data.warehouses.push(newWh);
    this.save();
    return newWh;
  }

  createLocation(locData) {
    const newLoc = { ...locData, id: `loc-${Date.now()}` };
    this.data.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  getLocationName(locId) {
    const loc = this.data.locations.find(l => l.id === locId);
    return loc ? `${loc.name} (${loc.code})` : locId;
  }
}

export const mockDb = new MockDatabase();
