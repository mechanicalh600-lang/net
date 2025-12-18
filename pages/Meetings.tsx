import React, { useState } from 'react';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { FileSignature, Plus, Users, Save } from 'lucide-react';

export const Meetings: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingCode(generateTrackingCode('G'));
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <FileSignature className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">ثبت صورتجلسات</h1>
      </div>

      {trackingCode ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
            <h3 className="text-xl font-bold text-green-700">صورتجلسه ثبت گردید</h3>
            <p className="mt-2 font-mono text-2xl font-bold">{trackingCode}</p>
            <button onClick={() => setTrackingCode(null)} className="mt-4 text-sm text-gray-500 underline">ثبت جدید</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm mb-1">کد صورتجلسه</label>
                <input type="text" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
             </div>
             <div>
                <label className="block text-sm mb-1">موضوع جلسه</label>
                <input type="text" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" required />
             </div>
             <div>
                <label className="block text-sm mb-1">محل برگزاری</label>
                <input type="text" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
             </div>
             <div>
                <label className="block text-sm mb-1">تاریخ</label>
                <input type="text" defaultValue={getShamsiDate()} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
             </div>
             <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs mb-1">ساعت شروع</label>
                    <input type="time" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
                 </div>
                 <div>
                    <label className="block text-xs mb-1">ساعت اتمام</label>
                    <input type="time" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
                 </div>
             </div>
          </div>

          <div>
             <label className="block text-sm mb-1 flex items-center gap-2">
                 <Users className="w-4 h-4" /> حاضرین در جلسه
             </label>
             <textarea className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 h-20" placeholder="نام افراد حاضر را وارد کنید..."></textarea>
          </div>

          <div>
             <label className="block text-sm mb-1 font-bold">تصمیمات متخذه</label>
             <textarea className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 h-32" required placeholder="شرح تصمیمات..."></textarea>
          </div>

          <div className="border border-dashed border-gray-300 rounded p-4 flex justify-between items-center">
             <span className="text-gray-500 text-sm">مستندات (عکس، اسکن امضاها)</span>
             <button type="button" className="text-blue-600 text-sm flex items-center gap-1">
                 <Plus className="w-4 h-4" /> افزودن فایل
             </button>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl shadow hover:bg-red-800 flex justify-center gap-2">
             <Save className="w-5 h-5" /> ثبت نهایی صورتجلسه
          </button>
        </form>
      )}
    </div>
  );
};