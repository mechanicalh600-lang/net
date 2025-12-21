
import React, { useState, useEffect } from 'react';
import { 
  PieChart, BarChart, FileSpreadsheet, Filter, RefreshCcw, 
  Settings, CheckSquare, Square, ChevronDown, ChevronUp 
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getItemsByModule, getAllWorkOrders } from '../workflowStore';
import { SystemLog } from '../types';

type DataSource = 'LOGINS' | 'WORK_ORDERS' | 'PARTS';

interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
}

export const Reports: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<DataSource>('LOGINS');
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  // Definition of available columns per source
  const sourceDefinitions: Record<DataSource, ColumnDef[]> = {
    LOGINS: [
      { id: 'userName', label: 'نام کاربر', visible: true },
      { id: 'personnelCode', label: 'کد پرسنلی', visible: true },
      { id: 'action', label: 'نوع عملیات', visible: true },
      { id: 'date', label: 'تاریخ', visible: true },
      { id: 'time', label: 'ساعت', visible: true },
      { id: 'ip', label: 'آدرس IP', visible: true },
      { id: 'details', label: 'جزئیات', visible: false },
    ],
    WORK_ORDERS: [
      { id: 'trackingCode', label: 'کد پیگیری', visible: true },
      { id: 'title', label: 'عنوان', visible: true },
      { id: 'requester', label: 'درخواست کننده', visible: true },
      { id: 'createdAt', label: 'تاریخ ثبت', visible: true },
      { id: 'status', label: 'وضعیت', visible: true },
      { id: 'equipName', label: 'تجهیز', visible: true },
    ],
    PARTS: [
      { id: 'partName', label: 'نام قطعه', visible: true },
      { id: 'qty', label: 'تعداد', visible: true },
      { id: 'unit', label: 'واحد', visible: true },
      { id: 'requester', label: 'درخواست کننده', visible: true },
      { id: 'createdAt', label: 'تاریخ', visible: true },
    ]
  };

  useEffect(() => {
    loadData();
    setColumns(sourceDefinitions[selectedSource]);
  }, [selectedSource]);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      setFilteredData(data.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(lower))
      ));
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const loadData = () => {
    let rawData: any[] = [];
    
    switch (selectedSource) {
      case 'LOGINS':
        rawData = JSON.parse(localStorage.getItem('system_logs') || '[]');
        // Sort by date/time descending
        rawData.reverse();
        break;
      case 'WORK_ORDERS':
        rawData = getAllWorkOrders().map(i => ({
          ...i,
          requester: i.data?.requester || '-',
          equipName: i.data?.equipName || '-'
        }));
        break;
      case 'PARTS':
        rawData = getItemsByModule('PART_REQUEST').map(i => ({
            ...i,
            partName: i.data?.partName,
            qty: i.data?.qty,
            unit: i.data?.unit,
            requester: i.description.split('توسط')[1] || '-'
        }));
        break;
    }
    setData(rawData);
    setFilteredData(rawData);
  };

  const toggleColumn = (colId: string) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, visible: !c.visible } : c));
  };

  const handleExport = () => {
    if (filteredData.length === 0) return alert('داده‌ای برای خروجی وجود ندارد');
    
    const visibleCols = columns.filter(c => c.visible);
    const headers = visibleCols.map(c => c.label);
    const rows = filteredData.map(item => visibleCols.map(c => item[c.id] || '-'));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n" 
        + rows.map(r => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `report_${selectedSource}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare Chart Data (Simple aggregation by first visible column)
  const getChartData = () => {
      if (filteredData.length === 0) return [];
      // Aggregate by Date for logs, or Status for Work Orders
      const key = selectedSource === 'LOGINS' ? 'date' : 'status';
      
      const counts: Record<string, number> = {};
      filteredData.forEach(item => {
          const val = item[key] || 'نامشخص';
          counts[val] = (counts[val] || 0) + 1;
      });
      
      return Object.keys(counts).map(k => ({ name: k, count: counts[k] })).slice(0, 10);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
             <PieChart className="w-6 h-6 text-primary" />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش‌ساز پویا</h1>
              <p className="text-xs text-gray-500 mt-1">ساخت، مشاهده و خروجی گرفتن از گزارشات سیستمی</p>
           </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
           <FileSpreadsheet className="w-5 h-5" /> خروجی اکسل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4"/> تنظیمات گزارش
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">منبع داده</label>
                          <select 
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value as DataSource)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm"
                          >
                              <option value="LOGINS">لاگ‌های ورود کاربران</option>
                              <option value="WORK_ORDERS">دستور کارها</option>
                              <option value="PARTS">درخواست‌های قطعه</option>
                          </select>
                      </div>

                      <div>
                          <button 
                            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                            className="flex items-center justify-between w-full text-xs font-bold text-gray-500 mb-2 hover:text-primary transition"
                          >
                             انتخاب ستون‌ها
                             {isOptionsOpen ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                          </button>
                          
                          {isOptionsOpen && (
                              <div className="space-y-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg max-h-60 overflow-y-auto">
                                  {columns.map(col => (
                                      <div key={col.id} onClick={() => toggleColumn(col.id)} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded">
                                          {col.visible ? 
                                            <CheckSquare className="w-4 h-4 text-primary" /> : 
                                            <Square className="w-4 h-4 text-gray-400" />
                                          }
                                          <span className="text-sm">{col.label}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                      
                      <button onClick={loadData} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition text-sm font-bold">
                          <RefreshCcw className="w-4 h-4" /> بروزرسانی داده‌ها
                      </button>
                  </div>
              </div>

              {/* Mini Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 h-64">
                   <h4 className="text-xs font-bold text-gray-500 mb-2 text-center">نمودار توزیع فراوانی</h4>
                   <ResponsiveContainer width="100%" height="90%">
                      <ReBarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={50} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#800020" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                   </ResponsiveContainer>
              </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full min-h-[500px]">
                   <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                       <h2 className="font-bold text-gray-700 dark:text-gray-200">پیش‌نمایش داده‌ها ({filteredData.length} رکورد)</h2>
                       <div className="relative w-64">
                          <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="جستجو در نتایج..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-9 pl-4 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                       </div>
                   </div>
                   
                   <div className="flex-1 overflow-auto">
                       <table className="w-full text-right text-sm">
                           <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0 shadow-sm">
                               <tr>
                                   {columns.filter(c => c.visible).map(col => (
                                       <th key={col.id} className="p-4 whitespace-nowrap">{col.label}</th>
                                   ))}
                               </tr>
                           </thead>
                           <tbody className="divide-y dark:divide-gray-600">
                               {filteredData.length > 0 ? (
                                   filteredData.map((item, idx) => (
                                       <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                           {columns.filter(c => c.visible).map(col => (
                                               <td key={col.id} className="p-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                                                   {item[col.id] || '-'}
                                               </td>
                                           ))}
                                       </tr>
                                   ))
                               ) : (
                                   <tr>
                                       <td colSpan={columns.filter(c => c.visible).length} className="p-10 text-center text-gray-400">
                                           داده‌ای یافت نشد
                                       </td>
                                   </tr>
                               )}
                           </tbody>
                       </table>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};
