import React from 'react';
import { User } from '../types';
import { Camera } from 'lucide-react';

export const Settings: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <h1 className="text-2xl font-bold">تنظیمات کاربری</h1>
       
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
           <div className="flex items-center gap-6 mb-8">
               <div className="relative">
                   <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl overflow-hidden">
                       {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : "👤"}
                   </div>
                   <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg">
                       <Camera className="w-4 h-4" />
                   </button>
               </div>
               <div>
                   <h2 className="text-xl font-bold">{user.fullName}</h2>
                   <p className="text-gray-500">{user.role}</p>
               </div>
           </div>

           <form className="space-y-4">
               <h3 className="font-bold border-b pb-2 mb-4">تغییر رمز عبور</h3>
               <div>
                   <label className="block text-sm mb-1">رمز عبور فعلی</label>
                   <input type="password" className="w-full p-2 border rounded dark:bg-gray-700" />
               </div>
               <div>
                   <label className="block text-sm mb-1">رمز عبور جدید</label>
                   <input type="password" className="w-full p-2 border rounded dark:bg-gray-700" />
               </div>
               <div>
                   <label className="block text-sm mb-1">تکرار رمز عبور جدید</label>
                   <input type="password" className="w-full p-2 border rounded dark:bg-gray-700" />
               </div>
               <button className="bg-primary text-white px-6 py-2 rounded shadow">ذخیره تغییرات</button>
           </form>
       </div>
    </div>
  );
};