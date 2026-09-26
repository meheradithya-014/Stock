import axios from 'axios';
import { mockDb } from './mockDatabase';

// Create real Axios instance
const axiosClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: simulated mock routing & error interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request fails or simulated mock mode
    const { config } = error;
    if (config && config.url) {
      console.warn(`[Axios Interceptor] Simulating local mock response for: ${config.method.toUpperCase()} ${config.url}`);
    }
    return Promise.reject(error);
  }
);

// Simulated Mock API Adapter over Axios with latency
export const mockApiRequest = async (method, endpoint, payload = null) => {
  // Artificial network latency for realistic UX with loading spinners
  await new Promise((resolve) => setTimeout(resolve, 180));

  const token = localStorage.getItem('stocksense_token');
  const userRole = localStorage.getItem('stocksense_role') || 'Inventory Manager';

  // --- Auth endpoints ---
  if (endpoint === '/auth/login') {
    const { email, password } = payload;
    if (!email || !password) throw new Error('Email and password required');
    const role = email.includes('staff') ? 'Warehouse Staff' : 'Inventory Manager';
    const mockToken = `jwt_${btoa(email)}_${Date.now()}`;
    return {
      user: {
        id: 'usr-1',
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
        role
      },
      token: mockToken
    };
  }

  if (endpoint === '/auth/register') {
    const { email, name, role } = payload;
    const mockToken = `jwt_${btoa(email)}_${Date.now()}`;
    return {
      user: {
        id: `usr-${Date.now()}`,
        email,
        name: name || 'Warehouse Operator',
        role: role || 'Warehouse Staff'
      },
      token: mockToken
    };
  }

  if (endpoint === '/auth/forgot-password/send-otp') {
    return { success: true, message: '6-digit OTP code sent to your registered email' };
  }

  if (endpoint === '/auth/forgot-password/verify-otp') {
    const { otp } = payload;
    if (otp !== '123456' && otp?.length !== 6) {
      throw new Error('Invalid OTP code. For demo, use 123456');
    }
    return { success: true, message: 'OTP verified successfully' };
  }

  if (endpoint === '/auth/forgot-password/reset') {
    return { success: true, message: 'Password updated successfully' };
  }

  // --- Products ---
  if (endpoint === '/products' && method === 'GET') {
    return mockDb.getProducts();
  }
  if (endpoint === '/products' && method === 'POST') {
    return mockDb.createProduct(payload);
  }
  if (endpoint.startsWith('/products/') && method === 'PUT') {
    const id = endpoint.split('/')[2];
    return mockDb.updateProduct(id, payload);
  }

  // --- Receipts ---
  if (endpoint === '/receipts' && method === 'GET') {
    return mockDb.getReceipts();
  }
  if (endpoint === '/receipts' && method === 'POST') {
    return mockDb.createReceipt(payload);
  }
  if (endpoint.endsWith('/validate') && endpoint.includes('/receipts/')) {
    const id = endpoint.split('/')[2];
    return mockDb.validateReceipt(id, userRole);
  }

  // --- Deliveries ---
  if (endpoint === '/deliveries' && method === 'GET') {
    return mockDb.getDeliveries();
  }
  if (endpoint === '/deliveries' && method === 'POST') {
    return mockDb.createDelivery(payload);
  }
  if (endpoint.endsWith('/step') && endpoint.includes('/deliveries/')) {
    const id = endpoint.split('/')[2];
    return mockDb.updateDeliveryStep(id, payload);
  }
  if (endpoint.endsWith('/validate') && endpoint.includes('/deliveries/')) {
    const id = endpoint.split('/')[2];
    return mockDb.validateDelivery(id, userRole);
  }

  // --- Transfers ---
  if (endpoint === '/transfers' && method === 'GET') {
    return mockDb.getTransfers();
  }
  if (endpoint === '/transfers' && method === 'POST') {
    return mockDb.createTransfer(payload);
  }
  if (endpoint.endsWith('/validate') && endpoint.includes('/transfers/')) {
    const id = endpoint.split('/')[2];
    return mockDb.validateTransfer(id, userRole);
  }

  // --- Adjustments ---
  if (endpoint === '/adjustments' && method === 'GET') {
    return mockDb.getAdjustments();
  }
  if (endpoint === '/adjustments' && method === 'POST') {
    return mockDb.createAdjustment(payload, userRole);
  }

  // --- Ledger ---
  if (endpoint === '/ledger' && method === 'GET') {
    return mockDb.getLedger();
  }

  // --- Warehouses & Locations ---
  if (endpoint === '/warehouses' && method === 'GET') {
    return mockDb.getWarehouses();
  }
  if (endpoint === '/warehouses' && method === 'POST') {
    return mockDb.createWarehouse(payload);
  }
  if (endpoint === '/locations' && method === 'GET') {
    return mockDb.getLocations();
  }
  if (endpoint === '/locations' && method === 'POST') {
    return mockDb.createLocation(payload);
  }

  throw new Error(`Unhandled mock endpoint: ${method} ${endpoint}`);
};

export default axiosClient;
