
import React, { useState, useRef, useEffect } from 'react';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { FileSignature, Plus, Users, Save, X, Trash2 } from 'lucide-react';
import { ShamsiDatePicker } from '../components/ShamsiDatePicker';
import { TimePicker24 } from '../components/TimePicker24';
import { SmartTable } from '../components/SmartTable';
import { startWorkflow, getItemsByModule, fetchMasterData } from '../workflowStore';
import { User } from '../types';

export const Meetings: React.FC<{ user: User }> = ({ user }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [items, setItems] = useState<any[]>([]);
  
  // Dynamic Data Lists
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [roleList, setRoleList] = useState<any[]>([]);

  useEffect(() => {
      const stored = getItemsByModule('MEETING');
      setItems(stored.map(i => ({...i, ...i.data})));
      
      fetchMasterData('personnel').then(setPersonnelList);
      fetchMasterData('org_chart').then(setRoleList);
  }, [view]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Attendee Selection State
  const [attendees, setAttendees] = useState<{name: string, role: string}[]>([]);
  const [currentAttendee, setCurrentAttendee] = useState({ name: '', role: '' });

  const [formData, setFormData] = useState({
      code: '',
      subject: '',
      location: '',
      meetingDate: getShamsiDate(),
      startTime: '',
      endTime: '',
      decisions: ''
  });

  const handleAddAttendee = () => {
      if(!currentAttendee.name || !currentAttendee.role) {
          alert("لطفا نام و سمت را انتخاب کنید");
          return;
      }
      setAttendees([...attendees, currentAttendee]);
      setCurrentAttendee({ name: '', role: '' });
  };

  const removeAttendee = (index: number) => {
      setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(attendees.length === 0) {
        alert("لطفا حداقل یک نفر حاضر در جلسه را وارد کنید");
        return;
    }

    const trackingCode = generateTrackingCode('G');
    // Flatten attendees to string for storage compatibility or store as object if workflow supports it
    // For now, storing as formatted string to keep consistency with existing simple data structure
    const attendeesString = attendees.map(a => `${a.name} - ${a.role}`).join('\n');
    
    startWorkflow('MEETING', { ...formData, attendees: attendeesString, attendeesList: attendees }, currentUser, trackingCode, `صورتجلسه: ${formData.subject}`);
    alert('صورتجلسه ثبت شد.');
    setView('LIST');
    setFormData({
        code: '', subject: '', location: '', meetingDate: getShamsiDate(), startTime: '', endTime: '', decisions: ''
    });
    setAttendees([]);
    setAttachedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  if (view === 'LIST') {
      return (
          <div className="max-w-7xl mx-auto pb-20">
              <SmartTable
                title="مدیریت صورتجلسات"
                icon={FileSignature}
                data={items}
                onAdd={() => setView('NEW')}
                columns={[
                    { header: 'کد پیگیری', accessor: (i: any) => i.trackingCode },
                    { header: 'موضوع جلسه', accessor: (i: any) => <span className="font-bold">{i.subject}</span> },
                    { header: 'تاریخ برگزاری', accessor: (i: any) => i.meetingDate },
                    { header: 'زمان', accessor: (i: any) => `${i.startTime} - ${i.endTime}` },
                    { header: 'مکان', accessor: (i: any) => i.location },
                    { header: 'وضعیت', accessor: (i: any) => i.status === 'PENDING' ? 'جاری' : 'بسته شده' },
                ]}
              />
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <FileSignature className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">ثبت صورتجلسه جدید</h1>
        </div>
        <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
      </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm mb-1 font-medium">کد صورتجلسه (دستی)</label>
                <input 
                    type="text" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                />
             </div>
             <div>
                <label className="block text-sm mb-1 font-medium">موضوع جلسه <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                    required 
                />
             </div>
             <div>
                <label className="block text-sm mb-1 font-medium">محل برگزاری</label>
                <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                />
             </div>
             <div>
                <ShamsiDatePicker 
                    label="تاریخ برگزاری"
                    value={formData.meetingDate}
                    onChange={d => setFormData({...formData, meetingDate: d})}
                />
             </div>
             <div className="grid grid-cols-2 gap-3 md:col-span-2">
                 <div>
                    <TimePicker24 
                        label="ساعت شروع"
                        value={formData.startTime}
                        onChange={t => setFormData({...formData, startTime: t})}
                    />
                 </div>
                 <div>
                    <TimePicker24 
                        label="ساعت اتمام"
                        value={formData.endTime}
                        onChange={t => setFormData({...formData, endTime: t})}
                    />
                 </div>
             </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
             <label className="block text-sm mb-3 font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                 <Users className="w-4 h-4" /> حاضرین در جلسه
             </label>
             <div className="flex gap-2 mb-3">
                 <select 
                    className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
                    value={currentAttendee.name}
                    onChange={e => setCurrentAttendee({...currentAttendee, name: e.target.value})}
                 >
                     <option value="">انتخاب نام شخص...</option>
                     {personnelList.map(p => (
                         <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name} ({p.unit})</option>
                     ))}
                 </select>
                 <select 
                    className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
                    value={currentAttendee.role}
                    onChange={e => setCurrentAttendee({...currentAttendee, role: e.target.value})}
                 >
                     <option value="">انتخاب سمت/مسئولیت...</option>
                     {roleList.map(r => (
                         <option key={r.id} value={r.name}>{r.name}</option>
                     ))}
                 </select>
                 <button type="button" onClick={handleAddAttendee} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                     <Plus className="w-5 h-5"/>
                 </button>
             </div>
             
             {attendees.length > 0 ? (
                 <ul className="space-y-2">
                     {attendees.map((att, idx) => (
                         <li key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
                             <span>{att.name} <span className="text-gray-400 mx-1">|</span> <span className="text-gray-500 dark:text-gray-400">{att.role}</span></span>
                             <button type="button" onClick={() => removeAttendee(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                         </li>
                     ))}
                 </ul>
             ) : (
                 <p className="text-xs text-gray-500 text-center py-2">لیست حاضرین خالی است.</p>
             )}
          </div>

          <div>
             <label className="block text-sm mb-1 font-bold">تصمیمات متخذه <span className="text-red-500">*</span></label>
             <textarea 
                value={formData.decisions}
                onChange={e => setFormData({...formData, decisions: e.target.value})}
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 h-32 focus:ring-2 focus:ring-primary outline-none" 
                required 
                placeholder="شرح تصمیمات..."
            ></textarea>
          </div>

          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-500 text-sm">مستندات (عکس، اسکن امضاها)</span>
                 <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileChange} />
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 text-sm flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition">
                     <Plus className="w-4 h-4" /> افزودن فایل
                 </button>
             </div>
             {attachedFiles.length > 0 && (
                 <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                     {attachedFiles.map((file, idx) => (
                         <li key={idx} className="flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                             {file.name}
                         </li>
                     ))}
                 </ul>
             )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setView('LIST')} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">انصراف</button>
            <button type="submit" className="flex-[2] bg-primary text-white py-3 rounded-xl shadow hover:bg-red-800 flex justify-center gap-2 font-bold transition">
                <Save className="w-5 h-5" /> ثبت نهایی صورتجلسه
            </button>
          </div>
        </form>
    </div>
  );
};
