import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { mockApiRequest } from '../api/axiosClient';
import { STATUSES } from '../utils/constants';
import { useAuth } from './AuthContext';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { isAuthenticated, setActiveWarehouse } = useAuth();
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, recs, dels, trfs, adjs, ledg, whs, locs] = await Promise.all([
        mockApiRequest('GET', '/products'),
        mockApiRequest('GET', '/receipts'),
        mockApiRequest('GET', '/deliveries'),
        mockApiRequest('GET', '/transfers'),
        mockApiRequest('GET', '/adjustments'),
        mockApiRequest('GET', '/ledger'),
        mockApiRequest('GET', '/warehouses'),
        mockApiRequest('GET', '/locations')
      ]);

      setProducts(prods);
      setReceipts(recs);
      setDeliveries(dels);
      setTransfers(trfs);
      setAdjustments(adjs);
      setLedger(ledg);
      setWarehouses(whs);
      setLocations(locs);
      if (whs.length && !whs.some((warehouse) => String(warehouse.id) === String(localStorage.getItem('stocksense_active_wh')))) {
        setActiveWarehouse(String(whs[0].id));
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshAll();
    else {
      setProducts([]); setReceipts([]); setDeliveries([]); setTransfers([]); setAdjustments([]); setLedger([]); setWarehouses([]); setLocations([]); setLoading(false);
    }
  }, [refreshAll, isAuthenticated]);

  // Product Actions
  const createProduct = async (productData) => {
    const newProd = await mockApiRequest('POST', '/products', productData);
    await refreshAll();
    return newProd;
  };

  const updateProduct = async (id, updates) => {
    const updated = await mockApiRequest('PUT', `/products/${id}`, updates);
    await refreshAll();
    return updated;
  };

  // Receipt Actions
  const createReceipt = async (receiptData) => {
    const newRec = await mockApiRequest('POST', '/receipts', receiptData);
    await refreshAll();
    return newRec;
  };

  const validateReceipt = async (id) => {
    const validated = await mockApiRequest('POST', `/receipts/${id}/validate`);
    await refreshAll();
    return validated;
  };

  // Delivery Actions
  const createDelivery = async (deliveryData) => {
    const newDel = await mockApiRequest('POST', '/deliveries', deliveryData);
    await refreshAll();
    return newDel;
  };

  const updateDeliveryStep = async (id, steps) => {
    const updated = await mockApiRequest('POST', `/deliveries/${id}/step`, steps);
    await refreshAll();
    return updated;
  };

  const validateDelivery = async (id) => {
    const validated = await mockApiRequest('POST', `/deliveries/${id}/validate`);
    await refreshAll();
    return validated;
  };

  // Transfer Actions
  const createTransfer = async (transferData) => {
    const newTrf = await mockApiRequest('POST', '/transfers', transferData);
    await refreshAll();
    return newTrf;
  };

  const validateTransfer = async (id) => {
    const validated = await mockApiRequest('POST', `/transfers/${id}/validate`);
    await refreshAll();
    return validated;
  };

  // Adjustment Actions
  const createAdjustment = async (adjData) => {
    const newAdj = await mockApiRequest('POST', '/adjustments', adjData);
    await refreshAll();
    return newAdj;
  };

  // Warehouse & Location Actions
  const createWarehouse = async (data) => {
    const newWh = await mockApiRequest('POST', '/warehouses', data);
    await refreshAll();
    return newWh;
  };

  const createLocation = async (data) => {
    const newLoc = await mockApiRequest('POST', '/locations', data);
    await refreshAll();
    return newLoc;
  };

  // Real-time Calculated KPI Stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minReorderLevel);
    const outOfStockItems = products.filter(p => (p.currentStock || 0) <= 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.currentStock * (p.unitCost || 0)), 0);

    const pendingReceipts = receipts.filter(r => r.status === STATUSES.WAITING || r.status === STATUSES.READY || r.status === STATUSES.DRAFT).length;
    const pendingDeliveries = deliveries.filter(d => d.status === STATUSES.WAITING || d.status === STATUSES.READY || d.status === STATUSES.DRAFT).length;
    const internalTransfersScheduled = transfers.filter(t => t.status === STATUSES.WAITING || t.status === STATUSES.READY || t.status === STATUSES.DRAFT).length;

    return {
      totalProducts,
      totalUnits,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      pendingReceipts,
      pendingDeliveries,
      internalTransfersScheduled,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems
    };
  }, [products, receipts, deliveries, transfers]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        receipts,
        deliveries,
        transfers,
        adjustments,
        ledger,
        warehouses,
        locations,
        loading,
        error,
        stats,
        refreshAll,
        createProduct,
        updateProduct,
        createReceipt,
        validateReceipt,
        createDelivery,
        updateDeliveryStep,
        validateDelivery,
        createTransfer,
        validateTransfer,
        createAdjustment,
        createWarehouse,
        createLocation
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within an InventoryProvider');
  return ctx;
};
