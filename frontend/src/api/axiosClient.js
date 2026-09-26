import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('stocksense_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use((response) => response, (error) => {
  const detail = error.response?.data?.detail;
  return Promise.reject(new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail || error.message || 'API request failed'));
});

const id = (value) => String(value);
const number = (value) => Number(value || 0);
const asUiProduct = (product, stock = []) => {
  const rows = stock.filter((row) => row.product_id === product.id);
  const locationStock = Object.fromEntries(rows.map((row) => [id(row.warehouse_id), number(row.quantity)]));
  const currentStock = Object.values(locationStock).reduce((sum, qty) => sum + qty, 0);
  return { ...product, id: id(product.id), uom: product.unit, minReorderLevel: number(product.reorder_level), maxLevel: Math.max(number(product.reorder_level) * 5, currentStock, 100), unitCost: 0, currentStock, locationStock };
};
const asUiOperation = (row, kind, products = [], warehouses = []) => {
  const product = products.find((item) => item.id === row.product_id);
  const source = warehouses.find((item) => item.id === (row.from_warehouse_id ?? row.warehouse_id));
  const destination = warehouses.find((item) => item.id === (row.to_warehouse_id ?? row.warehouse_id));
  const movementType = { RECEIPT: 'receipt', DELIVERY: 'delivery', TRANSFER_IN: 'internal', TRANSFER_OUT: 'internal', ADJUSTMENT: 'adjustment' }[row.operation_type];
  const type = kind === 'ledger' ? movementType : kind;
  const quantity = number(row.quantity ?? row.quantity_change);
  return {
    ...row,
    id: id(row.id), productId: id(row.product_id), warehouseId: id(row.warehouse_id ?? row.from_warehouse_id),
    destinationWarehouseId: row.to_warehouse_id == null ? undefined : id(row.to_warehouse_id),
    sourceLocationId: id(row.from_warehouse_id ?? row.warehouse_id), destinationLocationId: id(row.to_warehouse_id ?? row.warehouse_id),
    locationId: id(row.warehouse_id), qty: quantity, qtyChange: number(row.quantity_change),
    items: row.product_id == null ? [] : [{ productId: id(row.product_id), productName: product?.name || 'Item', sku: product?.sku || '', uom: product?.unit || '', qty: quantity }],
    productName: product?.name || 'Item', sku: product?.sku || '', uom: product?.unit || '',
    countedQty: number(row.counted_quantity), recordedQty: number(row.recorded_quantity),
    status: row.status || 'Done', vendor: row.supplier, customer: row.customer,
    fromLocation: source?.name || '', toLocation: destination?.name || '',
    destinationLocationId: id(row.to_warehouse_id ?? row.warehouse_id),
    reference: row.reference_id || `${kind.slice(0, 3).toUpperCase()}-${row.id}`, date: row.created_at,
    picked: false, packed: false, createdAt: row.created_at, type
  };
};

const requests = {
  login: (payload) => axiosClient.post('/auth/login', payload).then(({ data }) => ({ ...data, token: data.access_token })),
  register: (payload) => axiosClient.post('/auth/signup', payload),
  forgot: (payload) => axiosClient.post('/auth/forgot-password', payload),
  reset: (payload) => axiosClient.post('/auth/reset-password', payload),
};

export const mockApiRequest = async (method, endpoint, payload = null) => {
  const verb = method.toUpperCase();
  if (endpoint === '/auth/login') return requests.login(payload);
  if (endpoint === '/auth/register') return requests.register({ ...payload, password: payload.password });
  if (endpoint === '/auth/forgot-password/send-otp') return requests.forgot(payload);
  if (endpoint === '/auth/forgot-password/verify-otp') return { success: true };
  if (endpoint === '/auth/forgot-password/reset') return requests.reset({ email: payload.email, otp: payload.otp, new_password: payload.newPassword });
  if (/^\/(receipts|deliveries|transfers)\/[^/]+\/validate$/.test(endpoint)) return { message: 'Operation has already been posted to stock.' };
  if (/^\/deliveries\/[^/]+\/step$/.test(endpoint)) return { message: 'Picking and packing steps are not stored by this backend.' };

  if (endpoint === '/products' && verb === 'GET') {
    const [products, stock] = await Promise.all([axiosClient.get('/products'), axiosClient.get('/operations/stock')]);
    return products.data.map((product) => asUiProduct(product, stock.data));
  }
  if (endpoint === '/products' && verb === 'POST') {
    const categories = (await axiosClient.get('/categories')).data;
    let category = categories.find((item) => item.name === payload.category);
    if (!category && payload.category) category = (await axiosClient.post('/categories', { name: payload.category })).data;
    const warehouses = (await axiosClient.get('/warehouses')).data;
    const selectedWarehouse = payload.warehouseId || warehouses[0]?.id;
    const result = await axiosClient.post('/products', { name: payload.name, sku: payload.sku, category_id: Number(payload.categoryId || category?.id), unit: payload.uom || payload.unit || 'each', reorder_level: number(payload.minReorderLevel), initial_stock: number(payload.initialStock), warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : null });
    return result.data;
  }
  if (endpoint.startsWith('/products/') && verb === 'PUT') {
    const [, , productId] = endpoint.split('/');
    const categories = (await axiosClient.get('/categories')).data;
    let category = categories.find((item) => item.name === payload.category);
    if (!category && payload.category) category = (await axiosClient.post('/categories', { name: payload.category })).data;
    return (await axiosClient.put(`/products/${productId}`, { name: payload.name, category_id: Number(payload.categoryId || category?.id), unit: payload.uom || payload.unit, reorder_level: number(payload.minReorderLevel) })).data;
  }
  if (endpoint === '/warehouses' && verb === 'GET') return (await axiosClient.get('/warehouses')).data.map((w) => ({ ...w, id: id(w.id), warehouseId: id(w.id) }));
  if (endpoint === '/locations' && verb === 'GET') return (await axiosClient.get('/warehouses')).data.map((w) => ({ id: id(w.id), warehouseId: id(w.id), name: w.name, code: w.location || w.name, type: 'internal' }));
  if (endpoint === '/warehouses' && verb === 'POST') return (await axiosClient.post('/warehouses', payload)).data;
  if (endpoint === '/locations' && verb === 'POST') return (await axiosClient.post('/warehouses', { name: payload.name, location: payload.code || payload.name })).data;

  const lists = { '/receipts': 'receipts', '/deliveries': 'deliveries', '/transfers': 'transfers', '/adjustments': 'adjustments', '/ledger': 'ledger' };
  if (lists[endpoint] && verb === 'GET') {
    const [result, products, warehouses] = await Promise.all([axiosClient.get(`/operations/${lists[endpoint]}`), axiosClient.get('/products'), axiosClient.get('/warehouses')]);
    return result.data.map((row) => asUiOperation(row, lists[endpoint], products.data, warehouses.data));
  }
  if (endpoint === '/receipts' && verb === 'POST') {
    const items = payload.items || [payload];
    return Promise.all(items.map((item) => axiosClient.post('/operations/receipts', { supplier: payload.vendor || payload.supplier || 'Supplier', product_id: Number(item.productId), warehouse_id: Number(payload.warehouseId), quantity: number(item.qty) })));
  }
  if (endpoint === '/deliveries' && verb === 'POST') {
    const items = payload.items || [payload];
    return Promise.all(items.map((item) => axiosClient.post('/operations/deliveries', { customer: payload.customer || 'Customer', product_id: Number(item.productId), warehouse_id: Number(payload.warehouseId), quantity: number(item.qty) })));
  }
  if (endpoint === '/transfers' && verb === 'POST') return (await axiosClient.post('/operations/transfers', { product_id: Number(payload.productId), from_warehouse_id: Number(payload.sourceLocationId), to_warehouse_id: Number(payload.destinationLocationId), quantity: number(payload.qty) })).data;
  if (endpoint === '/adjustments' && verb === 'POST') return (await axiosClient.post('/operations/adjustments', { product_id: Number(payload.productId), warehouse_id: Number(payload.locationId || payload.warehouseId), counted_quantity: number(payload.countedQty) })).data;
  if (endpoint === '/dashboard' && verb === 'GET') return (await axiosClient.get('/dashboard')).data;
  throw new Error(`Unsupported API operation: ${verb} ${endpoint}`);
};

export default axiosClient;
