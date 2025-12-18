import React, { useState, useRef } from 'react';
import { GenericTable } from '../components/GenericTable';
import { Download, Upload, Plus, X, Save, Trash2 } from 'lucide-react';
import { generateId } from '../utils';

type EntityType = 'USERS' | 'PERSONNEL' | 'LOCATIONS' | 'EQUIPMENT' | 'PARTS' | 'PLANS';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EntityType>('PERSONNEL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data State
  const [data, setData] = useState<Record<EntityType, any[]>>({
    PERSONNEL: [
        { id: '1', code: '1001', name: 'علی رضایی', unit: 'مکانیک', mobile: '09121111111' },
        { id: '2', code: '1002', name: 'حسن پارسا', unit: 'برق', mobile: '09122222222' },
    ],
    USERS: [
        { id: '1', username: 'ali', role: 'USER', personnel: 'علی رضایی' },
    ],
    LOCATIONS: [
        { id: '1', code: 'L1', name: 'سالن تولید', parent: '-' },
    ],
    EQUIPMENT: [
        { id: '1', code: 'EQ-100', name: 'پمپ اصلی', location: 'سالن تولید' },
    ],
    PARTS: [],
    PLANS: []
  });

  const columnsMap: Record<EntityType, any[]> = {
      PERSONNEL: [
          { key: 'code', header: 'کد پرسنلی' },
          { key: 'name', header: 'نام و نام خانوادگی' },
          { key: 'unit', header: 'واحد سازمانی' },
          { key: 'mobile', header: 'موبایل' },
      ],
      USERS: [
          { key: 'username', header: 'نام کاربری' },
          { key: 'role', header: 'نقش' },
          { key: 'personnel', header: 'پرسنل' },
      ],
      LOCATIONS: [
           { key: 'code', header: 'کد مکان' },
           { key: 'name', header: 'نام مکان' },
           { key: 'parent', header: 'والد' },
      ],
      EQUIPMENT: [
           { key: 'code', header: 'کد' },
           { key: 'name', header: 'نام تجهیز' },
           { key: 'location', header: 'محل استقرار' },
      ],
      PARTS: [
          { key: 'code', header: 'کد قطعه'},
          { key: 'name', header: 'نام قطعه'},
      ],
      PLANS: [
          { key: 'name', header: 'نام پلن'},
      ]
  };

  const handleTabChange = (tab: EntityType) => {
    setActiveTab(tab);
    setSelectedIds([]); // Clear selection on tab change
  };

  const handleAddNew = () => {
    setEditingItem({});
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    if (window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
       setData(prev => ({
         ...prev,
         [activeTab]: prev[activeTab].filter(i => i.id !== item.id)
       }));
       // Remove from selectedIds if it was selected
       setSelectedIds(prev => prev.filter(id => id !== item.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`آیا از حذف ${selectedIds.length} رکورد انتخاب شده اطمینان دارید؟`)) {
       setData(prev => ({
         ...prev,
         [activeTab]: prev[activeTab].filter(i => !selectedIds.includes(i.id))
       }));
       setSelectedIds([]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { ...editingItem };
    if (!newItem.id) {
       newItem.id = generateId();
       setData(prev => ({
         ...prev,
         [activeTab]: [...prev[activeTab], newItem]
       }));
    } else {
       setData(prev => ({
         ...prev,
         [activeTab]: prev[activeTab].map(i => i.id === newItem.id ? newItem : i)
       }));
    }
    setIsModalOpen(false);
  };

  const handleDownloadSample = () => {
    const cols = columnsMap[activeTab].map(c => c.key);
    const csvContent = "data:text/csv;charset=utf-8," + cols.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sample_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`فایل ${file.name} با موفقیت دریافت شد. (شبیه‌سازی: 2 رکورد تستی اضافه شد)`);
      const mockNewItems = [
         { id: generateId(), code: 'IMP-1', name: 'تست ایمپورت 1', unit: 'تست' },
         { id: generateId(), code: 'IMP-2', name: 'تست ایمپورت 2', unit: 'تست' }
      ];
      const safeItems = mockNewItems.map(item => {
          const newItem: any = { id: item.id };
          columnsMap[activeTab].forEach(col => {
              newItem[col.key] = `Imported ${col.key}`;
          });
          return newItem;
      });

      setData(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], ...safeItems]
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">مدیریت اطلاعات پایه</h1>
        <div className="flex gap-2 w-full md:w-auto">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv, .xlsx" 
                className="hidden" 
            />
            <button onClick={handleImportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition shadow">
                <Upload className="w-4 h-4" /> وارد کردن اکسل
            </button>
             <button onClick={handleDownloadSample} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition shadow">
                <Download className="w-4 h-4" /> دانلود نمونه
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto flex gap-2 no-scrollbar">
         {(Object.keys(data) as EntityType[]).map(key => (
             <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === key ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
             >
                 {key === 'PERSONNEL' ? 'لیست پرسنل' : 
                  key === 'USERS' ? 'کاربران' :
                  key === 'LOCATIONS' ? 'ساختار مکان' :
                  key === 'EQUIPMENT' ? 'تجهیزات' : key}
             </button>
         ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                  <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">
                      {activeTab === 'PERSONNEL' ? 'لیست پرسنل' : activeTab}
                  </h3>
                  {selectedIds.length > 0 && (
                      <button 
                        onClick={handleBulkDelete}
                        className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition animate-fadeIn"
                      >
                          <Trash2 className="w-4 h-4" />
                          حذف {selectedIds.length} مورد
                      </button>
                  )}
              </div>
              
              <button onClick={handleAddNew} className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition shadow-lg shadow-red-900/20">
                  <Plus className="w-4 h-4" /> افزودن جدید
              </button>
          </div>
          
          <GenericTable 
            data={data[activeTab]} 
            columns={columnsMap[activeTab] || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectable={true}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
          />
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                  <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <h3 className="font-bold">{editingItem?.id ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      {columnsMap[activeTab].map(col => (
                          <div key={String(col.key)}>
                              <label className="block text-sm font-medium mb-1">{col.header}</label>
                              <input 
                                  type="text" 
                                  value={editingItem[col.key] || ''}
                                  onChange={(e) => setEditingItem({...editingItem, [col.key]: e.target.value})}
                                  className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none"
                                  required
                              />
                          </div>
                      ))}
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">انصراف</button>
                          <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-red-800 flex justify-center gap-2 items-center">
                              <Save className="w-4 h-4" /> ذخیره
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};