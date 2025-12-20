
import React, { useState, useRef, useEffect } from 'react';
import { Archive, Upload, Trash2, X } from 'lucide-react';
import { saveDocument, getAllDocuments, deleteDocument, DocumentItem } from '../workflowStore';
import { generateId, getShamsiDate } from '../utils';
import { SmartTable } from '../components/SmartTable';

export const Documents: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  
  useEffect(() => {
      setDocs(getAllDocuments());
  }, [view]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDoc, setNewDoc] = useState({ code: '', name: '', type: '' });

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.code || !newDoc.name) return;
    
    const doc: DocumentItem = {
        id: generateId(),
        code: newDoc.code,
        name: newDoc.name,
        type: newDoc.type,
        fileName: selectedFile ? selectedFile.name : 'بدون فایل',
        createdAt: getShamsiDate()
    };

    saveDocument(doc);
    alert('سند با موفقیت بایگانی شد.');
    
    setNewDoc({ code: '', name: '', type: '' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setView('LIST');
  };

  const handleDelete = (item: DocumentItem) => {
      if(window.confirm('آیا از حذف این سند اطمینان دارید؟')) {
          deleteDocument(item.id);
          setDocs(getAllDocuments());
      }
  };

  if (view === 'LIST') {
      return (
          <div className="max-w-7xl mx-auto pb-20">
              <SmartTable 
                title="بایگانی اسناد فنی"
                icon={Archive}
                data={docs}
                onAdd={() => setView('NEW')}
                onDelete={handleDelete}
                columns={[
                    { header: 'کد سند', accessor: (d) => <span className="font-mono font-bold">{d.code}</span> },
                    { header: 'عنوان سند', accessor: (d) => d.name },
                    { header: 'نوع سند', accessor: (d) => d.type },
                    { header: 'فایل پیوست', accessor: (d) => d.fileName || '-' },
                    { header: 'تاریخ بایگانی', accessor: (d) => d.createdAt },
                ]}
              />
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Archive className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">افزودن سند جدید به بایگانی</h1>
          </div>
          <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-fit">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">کد بایگانی <span className="text-red-500">*</span></label>
              <input 
                value={newDoc.code}
                onChange={(e) => setNewDoc({...newDoc, code: e.target.value})}
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="مثال: MAP-101"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">نام سند <span className="text-red-500">*</span></label>
              <input 
                value={newDoc.name}
                onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="عنوان نقشه یا کاتالوگ..."
              />
            </div>
            <div>
              <label className="block text-sm mb-1">نوع سند <span className="text-red-500">*</span></label>
              <select 
                value={newDoc.type}
                onChange={(e) => setNewDoc({...newDoc, type: e.target.value})}
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">انتخاب کنید...</option>
                <option value="MAP">نقشه</option>
                <option value="CATALOG">کاتالوگ</option>
                <option value="MANUAL">دستورالعمل</option>
                <option value="OTHER">سایر</option>
              </select>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div 
              onClick={handleFileClick}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                ${selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
            >
               <Upload className={`w-10 h-10 mx-auto mb-4 ${selectedFile ? 'text-green-600' : 'text-gray-400'}`} />
               <span className="text-sm font-bold text-gray-600 dark:text-gray-300 block">
                 {selectedFile ? selectedFile.name : 'برای آپلود فایل کلیک کنید'}
               </span>
               <span className="text-xs text-gray-400 mt-2 block">PDF, JPG, PNG (Max 10MB)</span>
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setView('LIST')} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">انصراف</button>
                <button type="submit" className="flex-[2] bg-primary text-white py-3 rounded-xl hover:bg-red-800 shadow-lg font-bold">
                افزودن به بایگانی
                </button>
            </div>
          </form>
        </div>
    </div>
  );
};
