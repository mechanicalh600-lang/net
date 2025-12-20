
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileSpreadsheet, ChevronLeft, ChevronRight, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  icon?: React.ElementType;
  onAdd?: () => void;
  onViewDetails?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchKeys?: (keyof T | string)[]; // properties to search in
}

export function SmartTable<T extends { id: string }>({ 
  data, 
  columns, 
  title, 
  icon: Icon, 
  onAdd, 
  onViewDetails,
  onDelete,
  searchKeys = []
}: SmartTableProps<T>) {
  
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let res = data;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      res = res.filter(item => {
        // Basic search in the object values or specific keys
        const values = Object.values(item as any).join(' ').toLowerCase();
        return values.includes(lowerTerm);
      });
    }
    setFilteredData(res);
    setCurrentPage(1);
  }, [data, searchTerm]);

  // Pagination
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = filteredData.slice(start, end);

  // Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(paginatedData.map(i => i.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // Export
  const handleExport = () => {
    const exportData = selectedIds.length > 0 ? data.filter(i => selectedIds.includes(i.id)) : filteredData;
    if (exportData.length === 0) return alert('داده‌ای برای خروجی وجود ندارد');
    
    // Simple CSV export
    const headers = columns.map(c => c.header);
    const rows = exportData.map(item => columns.map(c => {
        // Try to get plain text if accessor returns a simple value, else just "Complex Data"
        const val = c.accessor(item);
        return typeof val === 'string' || typeof val === 'number' ? val : '-';
    }));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n" 
        + rows.map(r => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          {Icon && <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><Icon className="w-6 h-6 text-primary" /></div>}
          <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
              <p className="text-xs text-gray-500 mt-1">مدیریت لیست {title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
                 <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium animate-fadeIn">
                     {selectedIds.length} انتخاب شده
                 </div>
            )}
            <button 
                onClick={handleExport}
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
            >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="hidden md:inline">اکسل</span>
            </button>
            {onAdd && (
                <button 
                onClick={onAdd}
                className="bg-primary text-white px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/20 flex items-center gap-2 hover:bg-red-800 transition transform active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">ثبت جدید</span>
                </button>
            )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
          <div className="relative flex-1">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="جستجو در لیست..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              />
          </div>
          <button className="bg-gray-50 dark:bg-gray-700 p-2.5 rounded-xl border border-gray-200 dark:border-gray-600">
             <Filter className="w-5 h-5 text-gray-500" />
          </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
                      <tr>
                          <th className="p-4 w-10">
                              <input 
                                type="checkbox" 
                                onChange={handleSelectAll}
                                checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                              />
                          </th>
                          {columns.map((col, idx) => (
                              <th key={idx} className="p-4">{col.header}</th>
                          ))}
                          <th className="p-4">عملیات</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                      {paginatedData.length > 0 ? (
                          paginatedData.map((item, idx) => (
                              <tr key={item.id || idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${selectedIds.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                  <td className="p-4">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleSelectOne(item.id)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                      />
                                  </td>
                                  {columns.map((col, cIdx) => (
                                      <td key={cIdx} className="p-4">{col.accessor(item)}</td>
                                  ))}
                                  <td className="p-4 flex gap-2">
                                      {onViewDetails && (
                                          <button onClick={() => onViewDetails(item)} className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                                              <Eye className="w-4 h-4" />
                                          </button>
                                      )}
                                      {onDelete && (
                                          <button onClick={() => onDelete(item)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan={columns.length + 2} className="p-12 text-center text-gray-400">
                                  موردی یافت نشد.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>نمایش</span>
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 outline-none"
                  >
                      <option value={10}>10</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                  </select>
                  <span>مجموع: {filteredData.length}</span>
              </div>
              <div className="flex gap-1">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                  <span className="px-4 py-2 text-sm font-bold">صفحه {currentPage}</span>
                  <button disabled={end >= filteredData.length} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg hover:bg-white disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
              </div>
          </div>
      </div>
    </div>
  );
}
