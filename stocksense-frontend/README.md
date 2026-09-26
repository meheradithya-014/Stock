# StockSense - Enterprise Inventory Management System (IMS)

StockSense is a modern, modular, and reactive web application designed for Inventory Managers and Warehouse Staff to digitize and streamline end-to-end warehouse logistics.

---

## 🚀 Key Architectural Features

1. **Reactive Inventory State Engine & Stock Ledger:**
   - Validating **Receipts** immediately increases warehouse stock and records arrival in the immutable Stock Ledger.
   - Validating **Delivery Orders** verifies Pick & Pack workflows and decrements available inventory.
   - **Internal Transfers** relocate quantities between staging areas (e.g. Main Store → Production Rack) with zero net loss.
   - **Stock Adjustments** reconcile physical floor counts against recorded balances, auto-calculating variance (+/-).

2. **Alpha Vantage Market Intelligence Integration:**
   - Integrates with [Alpha Vantage](https://www.alphavantage.co/) to provide real-time global commodity spot prices (Copper, Aluminum, Steel Index, Crude Oil benchmark) and foreign exchange rates.
   - Helps inventory managers forecast replacement valuation and buffer against material price inflation.
   - Includes in-app API key modal with graceful fallback intelligence.

3. **Multi-Role & Multi-Warehouse Navigation:**
   - Role-based permissions and 1-click test toggles for **Inventory Manager** and **Warehouse Staff**.
   - Multi-warehouse selector (e.g., Main Central Hub `WH-01` vs. West Distribution Center `WH-02`) with internal rack and bay breakdown.

4. **Authentication & Password Recovery:**
   - Secure login and registration.
   - 6-digit OTP-based password reset modal flow.

---

## 📁 Repository Structure

```
stocksense-frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── src/
│   ├── api/
│   │   ├── axiosClient.js          # Axios interceptors & mock API simulation
│   │   ├── mockDatabase.js         # Reactive in-memory / localStorage state
│   │   └── alphaVantageService.js  # Alpha Vantage market data service
│   ├── context/
│   │   ├── AuthContext.jsx         # User auth, roles & active warehouse
│   │   └── InventoryContext.jsx    # Real-time KPIs, operations & ledger
│   ├── components/
│   │   ├── common/                 # KpiCard, StatusBadge, DataTable, Modal, AlphaVantageTicker
│   │   ├── layout/                 # Sidebar, Topbar, AppLayout
│   │   ├── operations/             # ReceiptModal, DeliveryModal, TransferModal, AdjustmentModal
│   │   └── products/               # ProductModal
│   ├── pages/
│   │   ├── auth/                   # LoginPage, OtpResetModal
│   │   ├── dashboard/              # DashboardPage (KPIs, dynamic filters, live stream)
│   │   ├── products/               # ProductsPage (SKU search, location breakdown)
│   │   ├── operations/             # ReceiptsPage, DeliveriesPage, TransfersPage
│   │   ├── adjustments/            # AdjustmentsPage (variance reconciliation)
│   │   ├── ledger/                 # LedgerPage (audit trail, CSV export)
│   │   └── settings/               # WarehousesPage, ProfilePage
│   ├── utils/
│   │   ├── constants.js            # Enums, statuses, initial warehouses
│   │   └── formatters.js           # Currency, date, and variance formatters
│   ├── App.jsx                     # Route definitions & protected route guards
│   └── main.jsx                    # React 18 bootstrap
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Credentials
- **Inventory Manager:** `manager@stocksense.com` / `password123`
- **Warehouse Staff:** `staff@stocksense.com` / `password123`
- **Password Reset Demo OTP:** `123456`
- **Alpha Vantage Demo Key:** `demo` (or input your personal API key via Topbar / Profile)
