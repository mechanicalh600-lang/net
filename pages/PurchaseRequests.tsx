
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { ShoppingCart, Mic, AlertCircle, X } from 'lucide-react';
import { SmartTable } from '../components/SmartTable';
import { startWorkflow, getItemsByModule, fetchMasterData } from '../workflowStore';

export const PurchaseRequests: React.FC<{ user: User }> = ({ user }) => {
  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [items, setItems] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
      const stored = getItemsByModule('PURCHASE');
      setItems(stored.map(i => ({...i, ...i.data})));
      fetchMasterData('measurement_units').then(setUnits);
  }, [view]);

  const [requestNumber, setRequestNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('');

  // Set default unit
  useEffect(() => {
      if(units.length > 0 && !unit) setUnit(units[0].title);
  }, [units]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const regex = /^\d{2}\/\d{4}$/;
    if (!regex.test(requestNumber)) {
        setError('فرمت شماره درخواست صحیح نیست. فرمت صحیح: دو رقم سال / چهار رقم شماره (مثال: 03/1005)');
        return;
    }
    setError(null);
    const trackingCode = generateTrackingCode('K');
    startWorkflow('PURCHASE', { requestNumber, desc, qty, unit }, user, trackingCode, `خرید: ${desc.substring(0, 15)}...`);
    alert('درخواست خرید ثبت شد');
    setView('LIST');
    setRequestNumber('');
    setDesc('');
    setQty(1);
  };

  if (view === 'LIST') {
      return (
          <div className="max-w-7xl mx-auto pb-20">
              <SmartTable
                title="درخواست‌های خرید"
                icon={ShoppingCart}
                data={items}
                onAdd={() => setView('NEW')}
                columns={[
                    { header: 'کد پیگیری', accessor: (i: any) => i.trackingCode },
                    { header: 'شماره درخواست', accessor: (i: any) => <span className="font-mono font-bold">{i.requestNumber}</span> },
                    { header: 'شرح کالا', accessor: (i: any) => i.desc },
                    { header: 'تعداد', accessor: (i: any) => i.qty + ' ' + (i.unit || '') },
                    { header: 'تاریخ', accessor: (i: any) => i.createdAt },
                    { header: 'وضعیت', accessor: (i: any) => i.status === 'PENDING' ? 'در جریان' : 'تایید شده' },
                ]}
              />
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
       <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">درخواست خرید کالا/خدمات</h1>
        </div>
        <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
      </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="label-text">درخواست دهنده</label>
                      <input type="text" value={user.fullName} disabled className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                      <label className="label-text">شماره درخواست (فرمت: 03/1000) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={requestNumber}
                        onChange={(e) => {
                            setRequestNumber(e.target.value);
                            if(error) setError(null);
                        }}
                        className={`input-field font-mono text-center ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        placeholder="03/____"
                        required 
                        maxLength={7}
                      />
                      {error && <div className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /><span>{error}</span></div>}
                  </div>
                  <div>
                      <label className="label-text">تاریخ درخواست</label>
                      <input type="text" defaultValue={getShamsiDate()} className="input-field" disabled />
                  </div>
                  <div>
                      <label className="label-text">محل خرید</label>
                      <select className="input-field">
                          <option>ستاد (دفتر مرکزی)</option>
                          <option>مجتمع (کارخانه)</option>
                      </select>
                  </div>
                  <div>
                      <label className="label-text">اولویت</label>
                      <select className="input-field">
                          <option>عادی</option>
                          <option>فوری</option>
                          <option>بحرانی (توقف تولید)</option>
                      </select>
                  </div>
              </div>

              <div>
                  <label className="label-text">شرح درخواست <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <textarea 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="input-field h-32 pl-10" 
                        required 
                        placeholder="مشخصات فنی دقیق کالا یا خدمات..."
                      ></textarea>
                      <Mic className="absolute left-3 bottom-3 text-gray-400 cursor-pointer hover:text-primary" />
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                      <label className="label-text">تعداد <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        className="input-field" 
                        required 
                      />
                  </div>
                  <div className="col-span-1">
                      <label className="label-text">واحد <span className="text-red-500">*</span></label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-field">
                          {units.length > 0 ? units.map(u => (
                              <option key={u.id} value={u.title}>{u.title}</option>
                          )) : <option value="عدد">عدد</option>}
                      </select>
                  </div>
                  <div className="col-span-1">
                      <label className="label-text">وضعیت فعلی</label>
                      <div className="relative">
                        <input type="text" className="input-field pl-8" placeholder="مثلا: موجودی صفر" />
                        <Mic className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                  </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setView('LIST')} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">انصراف</button>
                <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-800 transition">
                    ثبت و ارسال به بازرگانی
                </button>
              </div>
          </form>

      <style>{`
        .label-text { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #4b5563; }
        .dark .label-text { color: #d1d5db; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background-color: #f9fafb; transition: all 0.2s; }
        .dark .input-field { background-color: #374151; border-color: #4b5563; color: white; }
        .input-field:focus { outline: none; border-color: #800020; ring: 2px; ring-color: #800020; }
      `}</style>
    </div>
  );
};
