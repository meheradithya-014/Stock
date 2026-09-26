import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  searchPlaceholder = 'Search records...',
  searchField = 'name',
  filterOptions = null,
  activeFilter = 'all',
  onFilterChange = () => {},
  pageSize = 8,
  actions = null,
  emptyMessage = 'No records found matching criteria.'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search matching
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesPrimary = String(item[searchField] || '').toLowerCase().includes(query);
        const matchesSku = String(item.sku || '').toLowerCase().includes(query);
        const matchesRef = String(item.reference || '').toLowerCase().includes(query);
        const matchesCustomer = String(item.customer || '').toLowerCase().includes(query);
        const matchesVendor = String(item.vendor || '').toLowerCase().includes(query);

        if (!matchesPrimary && !matchesSku && !matchesRef && !matchesCustomer && !matchesVendor) {
          return false;
        }
      }

      // Status/Category filter
      if (activeFilter && activeFilter !== 'all') {
        const matchesStatus = item.status?.toLowerCase() === activeFilter.toLowerCase();
        const matchesType = item.type?.toLowerCase() === activeFilter.toLowerCase();
        const matchesCat = item.category?.toLowerCase() === activeFilter.toLowerCase();
        if (!matchesStatus && !matchesType && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, searchField, activeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Badges / Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filterOptions && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onFilterChange(opt.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeFilter === opt.value
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3.5 ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50/75 transition-colors group"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-2">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
