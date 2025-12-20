
import React, { useState, useEffect, useRef } from 'react';
import { GenericTable } from '../components/GenericTable';
import { Download, Upload, Plus, X, Save, Trash2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../supabaseClient';

// لیست جداول مطابق با ساختار دیتابیس
type EntityType = 
  | 'user_groups' 
  | 'personnel' 
  | 'app_users' 
  | 'locations' 
  | 'org_chart' 
  | 'measurement_units' 
  | 'equipment_local_names' 
  | 'evaluation_periods' 
  | 'evaluation_criteria' 
  | 'equipment_classes' 
  | 'equipment_groups' 
  | 'equipment' 
  | 'equipment_tree' 
  | 'part_categories' 
  | 'parts' 
  | 'activity_cards' 
  | 'checklist_items' 
  | 'maintenance_plans';

const TABLE_LABELS: Record<EntityType, string> = {
  user_groups: 'گروه‌های کاربری',
  personnel: 'لیست پرسنل',
  app_users: 'کاربران سیستم',
  locations: 'ساختار لوکیشن',
  org_chart: 'چارت سازمانی',
  measurement_units: 'واحدهای اندازه‌گیری',
  equipment_local_names: 'نام محلی تجهیزات',
  evaluation_periods: 'دوره‌های ارزیابی',
  evaluation_criteria: 'شاخص‌های ارزیابی',
  equipment_classes: 'کلاس تجهیزات',
  equipment_groups: 'گروه تجهیزات',
  equipment: 'لیست تجهیزات',
  equipment_tree: 'درخت تجهیزات',
  part_categories: 'گروه قطعات (اصلی/فرعی)',
  parts: 'لیست قطعات و کالا',
  activity_cards: 'کارت فعالیت‌ها',
  checklist_items: 'آیتم‌های چک‌لیست',
  maintenance_plans: 'پلن‌های نت'
};

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EntityType>('personnel');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تعریف ستون‌ها برای هر جدول
  const columnsMap: Record<EntityType, any[]> = {
    user_groups: [
      { key: 'code', header: 'کد گروه' },
      { key: 'name', header: 'نام گروه' },
    ],
    personnel: [
      { key: 'personnel_code', header: 'کد پرسنلی' },
      { key: 'first_name', header: 'نام' },
      { key: 'last_name', header: 'نام خانوادگی' },
      { key: 'unit', header: 'واحد' },
      { key: 'mobile', header: 'موبایل' },
      { key: 'profile_picture', header: 'تصویر پروفایل (لینک)' },
    ],
    app_users: [
      { key: 'username', header: 'نام کاربری' },
      { key: 'personnel_id', header: 'شناسه پرسنل' },
      { key: 'role', header: 'نقش کاربری' },
      { key: 'is_default_password', header: 'رمز پیش‌فرض؟' },
    ],
    locations: [
      { key: 'code', header: 'کد' },
      { key: 'name', header: 'نام لوکیشن' },
      { key: 'parent_id', header: 'لوکیشن والد' },
    ],
    org_chart: [
      { key: 'code', header: 'کد واحد' },
      { key: 'name', header: 'نام واحد/سمت' },
      { key: 'manager_name', header: 'نام مسئول' },
    ],
    measurement_units: [
      { key: 'title', header: 'عنوان واحد' }
    ],
    equipment_local_names: [
      { key: 'class_id', header: 'شناسه کلاس' },
      { key: 'group_id', header: 'شناسه گروه' },
      { key: 'local_name', header: 'نام محلی/رایج' },
    ],
    evaluation_periods: [
      { key: 'code', header: 'کد دوره' },
      { key: 'title', header: 'عنوان دوره' },
    ],
    evaluation_criteria: [
      { key: 'title', header: 'عنوان شاخص' },
      { key: 'max_score', header: 'سقف امتیاز' },
    ],
    equipment_classes: [
      { key: 'id', header: 'شناسه کلاس' },
      { key: 'name', header: 'نام کلاس' },
    ],
    equipment_groups: [
      { key: 'id', header: 'شناسه گروه' },
      { key: 'name', header: 'نام گروه' },
      { key: 'class_id', header: 'کلاس والد' },
    ],
    equipment: [
      { key: 'code', header: 'کد تجهیز' },
      { key: 'name', header: 'نام فنی تجهیز' },
      { key: 'class_id', header: 'کلاس' },
      { key: 'group_id', header: 'گروه' },
    ],
    equipment_tree: [
       { key: 'equipment_id', header: 'تجهیز اصلی' },
       { key: 'code', header: 'کد جزء' },
       { key: 'name', header: 'نام جزء' },
       { key: 'parent_id', header: 'والد' },
    ],
    part_categories: [
       { key: 'name', header: 'نام دسته' },
       { key: 'parent_id', header: 'والد' },
       { key: 'level_type', header: 'سطح (MAIN/SUB/SUB_SUB)' },
    ],
    parts: [
       { key: 'code', header: 'کد قطعه' },
       { key: 'name', header: 'نام قطعه' },
       { key: 'category_id', header: 'شناسه دسته بندی (Sub-Sub)' },
       { key: 'stock_unit_id', header: 'واحد انبارش' },
       { key: 'consumption_unit_id', header: 'واحد مصرف' },
    ],
    activity_cards: [
        { key: 'code', header: 'کد کارت' },
        { key: 'name', header: 'نام فعالیت' },
    ],
    checklist_items: [
        { key: 'activity_card_id', header: 'کارت فعالیت' },
        { key: 'sort_order', header: 'ترتیب' },
        { key: 'description', header: 'شرح' },
    ],
    maintenance_plans: [
        { key: 'code', header: 'کد پلن' },
        { key: 'name', header: 'نام پلن' },
        { key: 'equipment_id', header: 'تجهیز' },
    ]
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: tableData, error } = await supabase
        .from(activeTab)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(tableData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Fallback for demo if supabase fails
      setData([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
  }, [activeTab]);

  const handleAddNew = () => {
    setEditingItem({});
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) return;
    try {
        const { error } = await supabase
            .from(activeTab)
            .delete()
            .eq('id', item.id);
        if (error) throw error;
        setData(prev => prev.filter(i => i.id !== item.id));
        setSelectedIds(prev => prev.filter(id => id !== item.id));
    } catch (err) {
        alert('خطا در حذف آیتم');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`آیا از حذف ${selectedIds.length} رکورد اطمینان دارید؟`)) return;
    try {
        const { error } = await supabase
            .from(activeTab)
            .delete()
            .in('id', selectedIds);
        if (error) throw error;
        setData(prev => prev.filter(i => !selectedIds.includes(i.id)));
        setSelectedIds([]);
    } catch (err) {
        alert('خطا در حذف گروهی');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (editingItem.id) {
            const { error } = await supabase
                .from(activeTab)
                .update(editingItem)
                .eq('id', editingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from(activeTab)
                .insert([editingItem]);
            if (error) throw error;
        }
        await fetchData();
        setIsModalOpen(false);
    } catch (err: any) {
        alert('خطا در ذخیره اطلاعات: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDownloadSample = () => {
      const cols = columnsMap[activeTab];
      const headers = cols.map(c => c.key).join(',');
      const csvContent = "\uFEFF" + headers; 
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeTab}_sample.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const text = evt.target?.result as string;
          if (!text) return;
          try {
              const rows = text.split('\n').filter(r => r.trim() !== '');
              if (rows.length < 2) { alert('فایل خالی یا نامعتبر است.'); return; }
              const headers = rows[0].split(',').map(h => h.trim());
              const cols = columnsMap[activeTab];
              const expectedKeys = cols.map(c => c.key);
              
              const dataToInsert = [];
              for (let i = 1; i < rows.length; i++) {
                  const values = rows[i].split(',');
                  if (values.length !== headers.length) continue;
                  const obj: any = {};
                  headers.forEach((h, index) => {
                      const cleanKey = h.replace(/\r/g, '');
                      const cleanValue = values[index]?.replace(/\r/g, '').trim();
                      if (expectedKeys.includes(cleanKey)) {
                          obj[cleanKey] = cleanValue;
                      }
                  });
                  if (Object.keys(obj).length > 0) dataToInsert.push(obj);
              }
              if (dataToInsert.length === 0) { alert('هیچ داده معتبری یافت نشد.'); return; }
              setLoading(true);
              const { error } = await supabase.from(activeTab).insert(dataToInsert);
              if (error) throw error;
              alert(`${dataToInsert.length} رکورد با موفقیت بارگذاری شد.`);
              await fetchData();
          } catch (err: any) {
              alert('خطا در پردازش فایل: ' + err.message);
          } finally {
              setLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">مدیریت اطلاعات پایه (Supabase)</h1>
        <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:rotate-180 transition duration-500">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{errorMsg}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto flex gap-2 no-scrollbar">
         {(Object.keys(TABLE_LABELS) as EntityType[]).map(key => (
             <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium
                    ${activeTab === key 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
             >
                 {TABLE_LABELS[key]}
             </button>
         ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm min-h-[400px]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                  <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">{TABLE_LABELS[activeTab]}</h3>
                  {selectedIds.length > 0 && (
                      <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition animate-fadeIn">
                          <Trash2 className="w-4 h-4" /> حذف {selectedIds.length} مورد
                      </button>
                  )}
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button onClick={handleDownloadSample} className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-100 transition">
                      <Download className="w-4 h-4" /> نمونه فایل
                  </button>
                  <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-100 transition">
                      <Upload className="w-4 h-4" /> بارگذاری CSV
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
                  <button onClick={handleAddNew} className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition shadow-lg">
                      <Plus className="w-4 h-4" /> افزودن جدید
                  </button>
              </div>
          </div>
          <GenericTable 
            data={data} 
            columns={columnsMap[activeTab] || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
            selectable={true}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
          />
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                  <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <h3 className="font-bold">{editingItem?.id ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      {columnsMap[activeTab].map(col => (
                          <div key={String(col.key)}>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{col.header}</label>
                              <input 
                                  type="text" 
                                  value={editingItem[col.key] || ''}
                                  onChange={(e) => setEditingItem({...editingItem, [col.key]: e.target.value})}
                                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
                              />
                          </div>
                      ))}
                      <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 transition">انصراف</button>
                          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-red-800 flex justify-center gap-2 items-center transition shadow-lg">
                              {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} ذخیره
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
