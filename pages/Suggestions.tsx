import React, { useState } from 'react';
import { User } from '../types';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { Mic, Paperclip, Send } from 'lucide-react';

export const Suggestions: React.FC<{ user: User }> = ({ user }) => {
  const [suggestion, setSuggestion] = useState('');
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setTrackingCode(generateTrackingCode('H'));
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">ثبت پیشنهادات فنی</h1>

      {trackingCode ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center space-y-4 animate-fadeIn">
           <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto text-green-600 text-3xl">✓</div>
           <h2 className="text-xl font-bold text-green-600">پیشنهاد شما با موفقیت ثبت شد</h2>
           <p className="text-gray-500">کد پیگیری شما:</p>
           <div className="text-3xl font-mono font-bold tracking-wider">{trackingCode}</div>
           <button onClick={() => { setTrackingCode(null); setSuggestion(''); }} className="text-primary underline mt-4">ثبت پیشنهاد جدید</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">پیشنهاد دهنده</label>
              <input type="text" value={user.fullName} disabled className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">تاریخ ثبت</label>
              <input type="text" value={getShamsiDate()} disabled className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-500" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">شرح پیشنهاد فنی</label>
             <div className="relative">
               <textarea 
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full h-40 p-3 pl-10 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="پیشنهاد خود را جهت بهبود عملکرد تجهیزات یا فرآیندها بنویسید..."
                  required
               ></textarea>
               <button type="button" className="absolute bottom-3 left-3 p-2 text-gray-400 hover:text-primary transition-colors">
                  <Mic className="w-6 h-6" />
               </button>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button type="button" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg">
                <Paperclip className="w-4 h-4" /> افزودن مستندات
             </button>
             <span className="text-xs text-gray-400">فایل‌های مجاز: PDF, JPG (max 5MB)</span>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl shadow-lg hover:bg-red-800 transition flex items-center justify-center gap-2">
             <Send className="w-5 h-5" /> ثبت پیشنهاد
          </button>
        </form>
      )}
    </div>
  );
};