import React, { useState } from 'react';
import { User } from '../types';
import { generateTrackingCode } from '../utils';

interface Props {
  user: User;
}

export const PartRequests: React.FC<Props> = ({ user }) => {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingCode(generateTrackingCode('P'));
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">درخواست قطعه از انبار</h1>
      
      {trackingCode ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl text-center border-2 border-green-200 dark:border-green-800">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">درخواست با موفقیت ثبت شد</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">جهت پیگیری از کد زیر استفاده نمایید</p>
              <div className="text-2xl font-mono font-bold bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner select-all">
                  {trackingCode}
              </div>
              <button 
                onClick={() => setTrackingCode(null)}
                className="mt-6 text-primary hover:underline"
              >
                  ثبت درخواست جدید
              </button>
          </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">درخواست کننده</label>
                    <input 
                        type="text" 
                        value={user.fullName} 
                        disabled 
                        className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 cursor-not-allowed" 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">کد قطعه</label>
                        <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" placeholder="جستجو..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام قطعه</label>
                        <select className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700">
                            <option>بلبرینگ 6204</option>
                            <option>تسمه V-Belt</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تعداد</label>
                        <input type="number" min="1" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">شماره دستور کار</label>
                        <select className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700">
                            <option>W403012293 - تعمیر پمپ</option>
                            <option>W403012294 - سرویس تسمه</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl shadow-lg hover:bg-red-800 transition">
                    ثبت درخواست
                </button>
            </form>
        </div>
      )}
    </div>
  );
};