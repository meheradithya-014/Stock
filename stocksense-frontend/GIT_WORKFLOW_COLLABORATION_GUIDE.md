# StockSense: Git Collaboration & Team Task Split Guide

This document defines the architectural task boundary, git branching model, interface contracts, and merge conflict prevention protocol for two developers collaborating concurrently on StockSense.

---

## 1. Team Ownership Matrix

| Area | Developer 1 (Lead Setup & Master Data) | Developer 2 (Operations & Ledger) |
|---|---|---|
| **Core Responsibilities** | Base config, UI system, Auth, Master Data (Products, Warehouses) | Operations flows (Receipts, Deliveries, Transfers, Adjustments), Ledger, Dashboard integration |
| **Direct File Ownership** | `vite.config.js`, `tailwind.config.js`<br>`src/components/layout/*`<br>`src/pages/auth/*`<br>`src/pages/products/*`<br>`src/pages/settings/*`<br>`src/context/AuthContext.jsx` | `src/pages/dashboard/*`<br>`src/pages/operations/*`<br>`src/pages/adjustments/*`<br>`src/pages/ledger/*`<br>`src/components/operations/*`<br>`src/api/alphaVantageService.js` |
| **Shared Contracts (Read-Only Once Agreed)** | `src/utils/constants.js`<br>`src/utils/formatters.js`<br>`src/context/InventoryContext.jsx`<br>`src/api/mockDatabase.js` | `src/utils/constants.js`<br>`src/utils/formatters.js`<br>`src/context/InventoryContext.jsx`<br>`src/api/mockDatabase.js` |

---

## 2. Git Branching Strategy & Workflow

```
main (Production Ready)
  └── dev (Integration Branch)
        ├── feat/dev1-auth-masterdata (Developer 1)
        └── feat/dev2-operations-ledger (Developer 2)
```

### Git Rules to Prevent Merge Conflicts:
1. **Never commit directly to `main` or `dev`**: All work happens on feature branches.
2. **Contract-First Development**:
   - Both developers adhere strictly to the shared schemas in `constants.js` and `InventoryContext.jsx`.
   - Modifying a shared interface requires a joint PR review before feature code is written.
3. **Daily Rebase Protocol**:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout feat/<your-feature>
   git rebase dev
   ```
4. **Independent Component Directories**:
   - Developer 1 writes only to `src/components/products/` and `src/components/layout/`.
   - Developer 2 writes only to `src/components/operations/` and `src/pages/operations/`.
   - This ensures 0% file overlap in PR diffs!

---

## 3. Developer Work Breakdown

### Developer 1 Checklist:
- [x] Initial Vite + React + Tailwind CSS configuration
- [x] Responsive Sidebar & Topbar navigation layout
- [x] Role-based routing guard (Inventory Manager vs. Warehouse Staff)
- [x] Login & Registration forms with validation
- [x] 6-digit OTP Password Reset modal
- [x] Product Master Data table with SKU search and filters
- [x] Location availability breakdown per product
- [x] Warehouse and location management views

### Developer 2 Checklist:
- [x] Inbound Receipts view with multi-line items and "Validate" trigger (stock increases)
- [x] Outbound Delivery Orders with Pick & Pack interactive checkboxes and "Validate" trigger (stock decreases)
- [x] Internal Transfers with Source → Destination location selector (net stock unchanged)
- [x] Stock Adjustments with Recorded vs. Physical count and auto-variance calculation
- [x] Immutable Move History / Stock Ledger with CSV export
- [x] Executive Dashboard with dynamic filters (DocType, Status, Warehouse, Category)
- [x] Alpha Vantage real-time commodity spot prices & replacement valuation widget
