import React, { useState } from 'react';
import { Mic, Save, Plus, Paperclip } from 'lucide-react';
import { generateTrackingCode, getShamsiDate } from '../utils';

type Tab = 'GENERAL' | 'LABOR' | 'PARTS' | 'DOCS';

export const WorkOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  
  // Form States (Simplified)
  const [formData, setFormData] = useState({
      equipCode: '',
      equipName: '',
      failureDesc: '',
      actionDesc: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateTrackingCode('W');
    setTrackingCode(code);
    // In real app, save to DB here
  };

  const TabButton = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors
        ${activeTab === id 
          ? 'border-primary text-primary dark:text-red-400' 
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ثبت گزارش کار</h1>
        {trackingCode && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-mono">
                کد پیگیری: {trackingCode}
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton id="GENERAL" label="دستور کار" />
          <TabButton id="LABOR" label="کارکرد نفرات" />
          <TabButton id="PARTS" label="قطعات مصرفی" />
          <TabButton id="DOCS" label="مستندات" />
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        کد تجهیز <span className="text-red-500">*</span>
                    </label>
                    <select 
                        required
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-red-200 dark:border-red-900 focus:ring-2 focus:ring-primary"
                    >
                        <option value="">انتخاب کنید</option>
                        <option value="PM-101">PM-101 (پمپ تغذیه)</option>
                        <option value="CV-202">CV-202 (نوار نقاله اصلی)</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">محل وقوع</label>
                     <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تاریخ گزارش</label>
                     <input type="text" disabled value={getShamsiDate()} className="w-full p-2 border rounded-lg bg-gray-200 dark:bg-gray-600 cursor-not-allowed" />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">درخواست دهنده</label>
                     <select className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700">
                         <option>علی محمدی</option>
                         <option>رضا حسینی</option>
                     </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">شرح خرابی</label>
                <div className="relative">
                    <textarea 
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 h-24 pl-10"
                        placeholder="توضیحات خرابی را وارد کنید..."
                    ></textarea>
                    <button type="button" className="absolute left-2 bottom-2 p-2 text-gray-400 hover:text-primary">
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اقدام صورت گرفته</label>
                <div className="relative">
                    <textarea 
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 h-24 pl-10"
                        placeholder="شرح تعمیرات..."
                    ></textarea>
                    <button type="button" className="absolute left-2 bottom-2 p-2 text-gray-400 hover:text-primary">
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs mb-1">مدت توقف (دقیقه)</label>
                    <input type="number" className="w-full p-2 border rounded bg-white dark:bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">زمان خالص تعمیر</label>
                    <input type="number" className="w-full p-2 border rounded bg-white dark:bg-gray-800" />
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'LABOR' && (
              <div className="text-center py-10">
                  <button type="button" className="flex items-center gap-2 mx-auto text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">
                      <Plus className="w-4 h-4" /> افزودن نیروی کار
                  </button>
                  <p className="text-gray-500 mt-4 text-sm">لیست نفرات خالی است</p>
              </div>
          )}

           {activeTab === 'PARTS' && (
              <div className="text-center py-10">
                   <button type="button" className="flex items-center gap-2 mx-auto text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">
                      <Plus className="w-4 h-4" /> افزودن قطعه مصرفی
                  </button>
              </div>
          )}

           {activeTab === 'DOCS' && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                  <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
                  <input type="file" className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm">
                      انتخاب فایل
                  </label>
              </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button 
                type="submit" 
                disabled={!!trackingCode}
                className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Save className="w-5 h-5" />
                  {trackingCode ? 'ثبت شد' : 'ثبت نهایی گزارش'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};