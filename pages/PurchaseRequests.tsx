import React, { useState } from 'react';
import { User } from '../types';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { ShoppingCart, Mic, CheckCircle } from 'lucide-react';

export const PurchaseRequests: React.FC<{ user: User }> = ({ user }) => {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingCode(generateTrackingCode('K'));
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
       <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">درخواست خرید کالا/خدمات</h1>
      </div>

      {trackingCode ? (
         <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
             <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">درخواست خرید ثبت شد</h2>
             <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg inline-block mx-auto mb-4">
                 <span className="text-gray-500 text-sm block">کد پیگیری</span>
                 <span className="text-2xl font-mono font-bold tracking-widest">{trackingCode}</span>
             </div>
             <br />
             <button onClick={() => setTrackingCode(null)} className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-red-800 transition">
                 بازگشت به فرم
             </button>
         </div>
      ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="label-text">درخواست دهنده</label>
                      <input type="text" value={user.fullName} disabled className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                      <label className="label-text">شماره درخواست (سیستمی/دستی)</label>
                      <input type="text" className="input-field" required />
                  </div>
                  <div>
                      <label className="label-text">تاریخ درخواست</label>
                      <input type="text" defaultValue={getShamsiDate()} className="input-field" />
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
                  <div>
                      <label className="label-text">کارشناس پیگیری</label>
                      <input type="text" className="input-field" />
                  </div>
              </div>

              <div>
                  <label className="label-text">شرح درخواست</label>
                  <div className="relative">
                      <textarea className="input-field h-32 pl-10" required placeholder="مشخصات فنی دقیق کالا یا خدمات..."></textarea>
                      <Mic className="absolute left-3 bottom-3 text-gray-400 cursor-pointer hover:text-primary" />
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                      <label className="label-text">تعداد</label>
                      <input type="number" className="input-field" required />
                  </div>
                  <div className="col-span-1">
                      <label className="label-text">واحد</label>
                      <select className="input-field">
                          <option>عدد</option>
                          <option>کیلوگرم</option>
                          <option>متر</option>
                          <option>دست</option>
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

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-800 transition">
                  ثبت و ارسال به بازرگانی
              </button>
          </form>
      )}

      <style>{`
        .label-text { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #4b5563; }
        .dark .label-text { color: #d1d5db; }
        .input-field { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background-color: #f9fafb; }
        .dark .input-field { background-color: #374151; border-color: #4b5563; color: white; }
        .input-field:focus { outline: none; border-color: #800020; ring: 2px; ring-color: #800020; }
      `}</style>
    </div>
  );
};