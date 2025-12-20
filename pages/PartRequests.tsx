
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { generateTrackingCode, getShamsiDate, getTime } from '../utils';
import { Package, X } from 'lucide-react';
import { startWorkflow, getItemsByModule, fetchMasterData } from '../workflowStore';
import { SmartTable } from '../components/SmartTable';

interface Props {
  user: User;
}

export const PartRequests: React.FC<Props> = ({ user }) => {
  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [items, setItems] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  
  useEffect(() => {
      const stored = getItemsByModule('PART_REQUEST');
      setItems(stored.map(i => ({...i, ...i.data})));
      
      // Fetch dynamic units
      fetchMasterData('measurement_units').then(setUnits);
  }, [view]);

  const [formData, setFormData] = useState({
      partName: '',
      partCode: '',
      qty: 1,
      unit: '',
      relatedWorkOrder: '',
      requestReason: '' // New Field for manual description
  });

  // Set default unit when loaded
  useEffect(() => {
      if (units.length > 0 && !formData.unit) {
          setFormData(prev => ({ ...prev, unit: units[0].title }));
      }
  }, [units]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.relatedWorkOrder && !formData.requestReason.trim()) {
        alert('در صورت عدم انتخاب دستور کار، وارد کردن علت درخواست (توضیحات) الزامی است.');
        return;
    }

    const trackingCode = generateTrackingCode('P');
    startWorkflow('PART_REQUEST', formData, user, trackingCode, `درخواست قطعه: ${formData.partName}`);
    alert('درخواست قطعه با موفقیت ثبت شد.');
    setView('LIST');
    setFormData({ partName: '', partCode: '', qty: 1, unit: units[0]?.title || 'عدد', relatedWorkOrder: '', requestReason: '' });
  };

  if (view === 'LIST') {
      return (
          <div className="max-w-7xl mx-auto pb-20">
              <SmartTable
                title="درخواست‌های قطعه و کالا"
                icon={Package}
                data={items}
                onAdd={() => setView('NEW')}
                columns={[
                    { header: 'کد پیگیری', accessor: (i: any) => i.trackingCode },
                    { header: 'نام قطعه', accessor: (i: any) => <span className="font-bold">{i.partName}</span> },
                    { header: 'کد کالا', accessor: (i: any) => i.partCode || '-' },
                    { header: 'تعداد', accessor: (i: any) => <span className="bg-blue-50 text-blue-700 px-2 rounded">{i.qty} {i.unit}</span> },
                    { header: 'تاریخ درخواست', accessor: (i: any) => i.createdAt },
                    { header: 'درخواست کننده', accessor: (i: any) => i.description.split('توسط')[1] || '-' },
                    { header: 'وضعیت', accessor: (i: any) => i.status === 'PENDING' ? 'در انتظار تایید' : 'تایید شده' },
                ]}
              />
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="text-primary"/> درخواست قطعه از انبار</h1>
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
      
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                     <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">تاریخ درخواست</label>
                        <input type="text" value={getShamsiDate()} disabled className="w-full p-2 border rounded-lg bg-white dark:bg-gray-600 text-center font-bold text-gray-700 dark:text-gray-200 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">ساعت</label>
                        <input type="text" value={getTime()} disabled className="w-full p-2 border rounded-lg bg-white dark:bg-gray-600 text-center font-bold text-gray-700 dark:text-gray-200 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">درخواست کننده</label>
                        <input type="text" value={user.fullName} disabled className="w-full p-2 border rounded-lg bg-white dark:bg-gray-600 text-center font-bold text-gray-700 dark:text-gray-200 cursor-not-allowed" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">کد قطعه (اختیاری)</label>
                        <input 
                            type="text" 
                            value={formData.partCode}
                            onChange={e => setFormData({...formData, partCode: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" placeholder="کد کالا..." 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام قطعه / شرح <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required 
                            value={formData.partName}
                            onChange={e => setFormData({...formData, partName: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" placeholder="جستجو یا تایپ کنید..." 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تعداد <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            min="1" 
                            value={formData.qty}
                            onChange={e => setFormData({...formData, qty: Number(e.target.value)})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">واحد <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.unit}
                            onChange={e => setFormData({...formData, unit: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" required
                        >
                             {units.length > 0 ? units.map(u => (
                                 <option key={u.id} value={u.title}>{u.title}</option>
                             )) : <option value="عدد">عدد</option>}
                        </select>
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">شماره دستور کار مربوطه</label>
                    <select 
                        value={formData.relatedWorkOrder}
                        onChange={e => setFormData({...formData, relatedWorkOrder: e.target.value})}
                        className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">انتخاب کنید (اختیاری)</option>
                        <option>W403012293 - تعمیر پمپ</option>
                        <option>W403012294 - سرویس تسمه</option>
                    </select>
                </div>

                {/* Conditional Description Field */}
                {!formData.relatedWorkOrder && (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                             علت درخواست / توضیحات فنی <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            value={formData.requestReason}
                            onChange={e => setFormData({...formData, requestReason: e.target.value})}
                            className="w-full p-3 border rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary h-24"
                            placeholder="لطفا علت نیاز به قطعه را شرح دهید (چون دستور کار انتخاب نشده است)..."
                        ></textarea>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setView('LIST')} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">انصراف</button>
                    <button type="submit" className="flex-[2] bg-primary text-white py-3 rounded-xl shadow-lg hover:bg-red-800 transition transform active:scale-95 font-bold">
                        ثبت نهایی درخواست
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};
