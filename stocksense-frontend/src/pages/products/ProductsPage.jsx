import React, { useState } from 'react';
import { Plus, Edit2, AlertCircle, MapPin, Search, Filter } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DataTable } from '../../components/common/DataTable';
import { ProductModal } from '../../components/products/ProductModal';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export const ProductsPage = () => {
  const { products, locations, createProduct, updateProduct } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedLocationsProdId, setExpandedLocationsProdId] = useState(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await createProduct(data);
    }
  };

  const filterOptions = [
    { label: 'All Categories', value: 'all' },
    ...PRODUCT_CATEGORIES.map(c => ({ label: c, value: c }))
  ];

  const columns = [
    {
      header: 'Product & SKU',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-xs font-mono text-emerald-600 font-semibold">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
          {row.category}
        </span>
      )
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      render: (row) => {
        const isLow = row.currentStock <= row.minReorderLevel;
        const isOut = row.currentStock === 0;

        return (
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold font-mono ${
                isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {row.currentStock} {row.uom}
              </span>
              {isLow && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {isOut ? 'Out of Stock' : 'Reorder Alert'}
                </span>
              )}
            </div>

            {/* Reordering rule progress indicator */}
            <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (row.currentStock / (row.maxLevel || 100)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Min: {row.minReorderLevel} | Max: {row.maxLevel} {row.uom}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Locations Breakdown',
      accessor: 'locationStock',
      render: (row) => {
        const isExpanded = expandedLocationsProdId === row.id;
        const locEntries = Object.entries(row.locationStock || {});

        return (
          <div>
            <button
              onClick={() => setExpandedLocationsProdId(isExpanded ? null : row.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>{locEntries.length} Staging Areas</span>
            </button>

            {isExpanded && (
              <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                {locEntries.map(([locId, qty]) => {
                  const loc = locations.find(l => l.id === locId);
                  return (
                    <div key={locId} className="flex justify-between items-center text-slate-600">
                      <span>{loc?.name || locId}:</span>
                      <span className="font-mono font-bold text-slate-900">{qty} {row.uom}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Standard Cost & Price',
      accessor: 'unitCost',
      render: (row) => (
        <div className="text-xs">
          <div className="text-slate-600">Cost: <span className="font-semibold text-slate-900">{formatCurrency(row.unitCost)}</span></div>
          <div className="text-slate-600">Price: <span className="font-semibold text-emerald-600">{formatCurrency(row.unitPrice)}</span></div>
        </div>
      )
    },
    {
      header: 'Actions',
      width: '80px',
      render: (row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Edit Product"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog & Stock Master
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKU definitions, reordering thresholds, units of measure, and per-location inventory
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Product
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={products}
        searchField="name"
        searchPlaceholder="Search by Product Name or SKU..."
        filterOptions={filterOptions}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
        pageSize={8}
      />

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
};
