import React from 'react';
import { User } from '../types';
import { Camera, Snowflake } from 'lucide-react';

interface SettingsProps {
  user: User;
  snowMode: boolean;
  setSnowMode: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, snowMode, setSnowMode }) => {
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

           <form className="space-y-6">
               <div className="space-y-4">
                 <h3 className="font-bold border-b pb-2">تنظیمات ظاهری</h3>
                 
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <Snowflake className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-medium block">تم بارش برف</span>
                            <span className="text-xs text-gray-500">افکت مینیمال زمستانی در کل برنامه</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={snowMode}
                            onChange={(e) => setSnowMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                    </label>
                 </div>
               </div>

               <div className="space-y-4">
                 <h3 className="font-bold border-b pb-2">امنیت</h3>
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
               </div>
           </form>
       </div>
    </div>
  );
};