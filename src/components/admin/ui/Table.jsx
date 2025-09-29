// components/admin/ui/table/Table.jsx
'use client';

import { useState, useMemo } from 'react';
import { Filter, ChevronUp, ChevronDown, Search, LoaderCircle, RotateCw } from 'lucide-react'; // Added RotateCw

const Table = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  selectable = false,
  searchPlaceholder = "Type to search...",
  emptyMessage = "No data found",
  className = "",
  maxHeight = "500px",
  onSelectionChange = () => { },
  onRowClick = () => { },
  bulkActions = [],
  onBulkAction = () => { },
  searchKeys = [], // specify which keys to search in, defaults to all string columns
  onReload = null, // New prop for reload functionality
  // Pass handlers explicitly for actions column, e.g., { handleEdit, handleDelete }
  handlers = {},
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [bulkActionValue, setBulkActionValue] = useState('');

  const columnHasRenderForSearch = (key) => {
    return columns.some(col => col.key === key && col.render);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filtering
    if (search && searchable) {
      const searchLower = search.toLowerCase();
      const keysToSearch = searchKeys.length ? searchKeys :
        columns.map(col => col.key).filter(key => {
          const sample = data[0]?.[key];
          return typeof sample === 'string' || typeof sample === 'number';
        });

      filtered = data.filter(item =>
        keysToSearch.some(key => {
          const value = item[key];
          // Handle cases where render function might be used to derive a searchable value
          if (columnHasRenderForSearch(key) && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // If the key refers to an object like 'parent_id' but we want to search 'parent_name'
            // This is a complex case, and ideally, 'parent_name' would be a direct property for search.
            // For now, assume simple string/number keys or pre-processed data.
            // We'll address 'parent_name' directly in the page.js searchKeys.
            return false;
          }
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Sorting
    if (sortKey && sortable) {
      const direction = sortDir === 'asc' ? 1 : -1;
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Numeric sort if values are numbers, otherwise string comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * direction;
        }
        return String(aVal).localeCompare(String(bVal)) * direction;
      });
    }

    return filtered;
  }, [data, search, sortKey, sortDir, searchable, sortable, columns, searchKeys]);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Handle selection
  const toggleSelect = (id) => {
    if (!selectable) return;
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const toggleSelectAll = () => {
    if (!selectable) return;
    const newSelected = selected.size === processedData.length && processedData.length > 0
      ? new Set()
      : new Set(processedData.map(item => item.id || item._id));
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  // Handle bulk actions
  const executeBulkAction = () => {
    if (bulkActionValue && selected.size > 0) {
      onBulkAction(bulkActionValue, Array.from(selected));
      setSelected(new Set());
      setBulkActionValue('');
    }
  };

  return (
    <div className={`border border-black rounded-xl bg-[#ffedd9] p-5 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-3">
        {/* Bulk Actions */}
        {selectable && bulkActions.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              className="bg-transparent border border-black rounded px-3 py-1 text-[12px]"
              value={bulkActionValue}
              onChange={(e) => setBulkActionValue(e.target.value)}
            >
              <option value="">Bulk Action</option>
              {bulkActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
            <button
              onClick={executeBulkAction}
              disabled={!bulkActionValue || selected.size === 0}
              className="px-3 py-1 bg-red-700 text-white border border-black rounded text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓
            </button>
          </div>
        )}

        {(!selectable || bulkActions.length === 0) && <div />}

        {/* Divider */}
        {selectable && bulkActions.length > 0 && searchable && (
          <div className="h-5 w-px bg-black/30" />
        )}

        {/* Search and Reload */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {searchable && (
            <div className="flex items-center gap-2 max-w-sm text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white">
              <Search className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 text-sm"
              />
            </div>
          )}
          {onReload && (
            <button
              onClick={onReload}
              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
              aria-label="Reload data"
            >
              <RotateCw className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-auto rounded-lg border border-black"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#f2cfa6] z-10">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.size === processedData.length && processedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3 h-3"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false ? handleSort(column.key) : null}
                  className={`px-3 py-2 text-left font-semibold text-sm ${sortable && column.sortable !== false
                      ? 'cursor-pointer select-none hover:bg-[#eab892]'
                      : ''
                    } ${column.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-2 text-xs" >
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        {sortKey === column.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <Filter className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-10 text-gray-500"
                >
                  <div className="flex justify-center items-center text-sm">
                    <LoaderCircle className="w-5 h-5 animate-spin mr-2" /> Loading data...
                  </div>
                </td>
              </tr>
            ) : processedData.length > 0 ? (
              processedData.map((row, index) => {
                const rowId = row.id || row._id || `row-${index}`; // Ensure a unique key
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick(row, index)}
                    className={`border-b border-black/20 hover:bg-orange-100 transition-colors text-sm ${onRowClick !== (() => { }) ? 'cursor-pointer' : ''
                      }`}
                  >
                    {/* Selection column */}
                    {selectable && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected.has(rowId)}
                          onChange={() => toggleSelect(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3 h-3"
                        />
                      </td>
                    )}

                    {/* Data columns */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-2 py-2 text-xs ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(row, handlers) // Pass the entire row and handlers
                          : row[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-10 text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {processedData.length > 0 && (
        <div className="mt-3 text-[10px] text-gray-600 flex justify-between">
          <span>
            Showing {processedData.length} of {data.length} entries
          </span>
          {selectable && selected.size > 0 && (
            <span>
              {selected.size} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;