import React, { useState } from 'react';
import { Archive, Upload, File, Trash2, Search } from 'lucide-react';

interface Doc {
  id: string;
  code: string;
  name: string;
  type: string;
}

export const Documents: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>([
    { id: '1', code: 'D-100', name: 'نقشه برق پمپ', type: 'نقشه فنی' },
    { id: '2', code: 'D-101', name: 'کاتالوگ گیربکس', type: 'کاتالوگ' },
  ]);
  
  const [newDoc, setNewDoc] = useState({ code: '', name: '', type: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.code || !newDoc.name) return;
    setDocs([...docs, { id: Math.random().toString(), ...newDoc }]);
    setNewDoc({ code: '', name: '', type: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Archive className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">بایگانی اسناد فنی</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="font-bold mb-4 border-b pb-2">افزودن سند جدید</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">کد بایگانی</label>
              <input 
                value={newDoc.code}
                onChange={(e) => setNewDoc({...newDoc, code: e.target.value})}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">نام سند</label>
              <input 
                value={newDoc.name}
                onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">نوع سند</label>
              <select 
                value={newDoc.type}
                onChange={(e) => setNewDoc({...newDoc, type: e.target.value})}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
              >
                <option value="">انتخاب کنید...</option>
                <option value="MAP">نقشه</option>
                <option value="CATALOG">کاتالوگ</option>
                <option value="MANUAL">دستورالعمل</option>
                <option value="OTHER">سایر</option>
              </select>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
               <Upload className="w-6 h-6 mx-auto text-gray-400" />
               <span className="text-xs text-gray-500">انتخاب فایل</span>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-red-800">
              افزودن به بایگانی
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex gap-2">
             <Search className="text-gray-400" />
             <input type="text" placeholder="جستجو در اسناد..." className="bg-transparent w-full outline-none" />
           </div>

           <div className="grid gap-4">
             {docs.map(doc => (
               <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                      <File className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">{doc.name}</h3>
                      <div className="text-sm text-gray-500 flex gap-4">
                        <span>کد: {doc.code}</span>
                        <span>نوع: {doc.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};