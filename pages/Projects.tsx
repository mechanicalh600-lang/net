
import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { Briefcase, Plus, TrendingUp, CheckSquare, Trash2, Save, X } from 'lucide-react';
import { startWorkflow, getItemsByModule } from '../workflowStore';
import { generateTrackingCode, getShamsiDate } from '../utils';
import { ShamsiDatePicker } from '../components/ShamsiDatePicker';
import { SmartTable } from '../components/SmartTable';

interface Milestone {
  id: string;
  title: string;
  weight: number; 
  progress: number;
}

export const Projects: React.FC<{ user: User }> = ({ user }) => {
  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [items, setItems] = useState<any[]>([]);

  // Load projects from store
  useEffect(() => {
      const storedItems = getItemsByModule('PROJECT');
      setItems(storedItems.map(item => ({
          ...item,
          ...item.data // Flatten data for table access
      })));
  }, [view]);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    manager: '',
    budget: 0,
    startDate: getShamsiDate(),
    endDate: '',
    description: ''
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', weight: 10 });

  const handleAddMilestone = () => {
      if(!newMilestone.title) return;
      setMilestones([...milestones, {
          id: Math.random().toString(),
          title: newMilestone.title,
          weight: newMilestone.weight,
          progress: 0
      }]);
      setNewMilestone({ title: '', weight: 10 });
  };

  const removeMilestone = (id: string) => {
      setMilestones(milestones.filter(m => m.id !== id));
  };

  const calculateTotalProgress = () => {
      const totalWeight = milestones.reduce((acc, curr) => acc + curr.weight, 0);
      if (totalWeight === 0) return 0;
      const weightedProgress = milestones.reduce((acc, curr) => acc + (curr.progress * curr.weight), 0);
      return Math.round(weightedProgress / totalWeight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingCode = generateTrackingCode('P');
    
    const totalWeight = milestones.reduce((acc, curr) => acc + curr.weight, 0);
    if (milestones.length > 0 && totalWeight !== 100) {
        alert(`مجموع وزن فازها باید ۱۰۰ باشد. مجموع فعلی: ${totalWeight}`);
        return;
    }

    const finalProjectData = {
        ...formData,
        milestones,
        progress: calculateTotalProgress()
    };
    
    startWorkflow('PROJECT', finalProjectData, user, trackingCode, `پروژه: ${formData.title}`);
    
    alert('پروژه تعریف شد و در گردش کار قرار گرفت.');
    setView('LIST');
    setFormData({
        title: '',
        manager: '',
        budget: 0,
        startDate: getShamsiDate(),
        endDate: '',
        description: ''
    });
    setMilestones([]);
  };

  if (view === 'LIST') {
      return (
          <div className="max-w-7xl mx-auto pb-20">
              <SmartTable
                title="مدیریت و کنترل پروژه‌ها"
                icon={Briefcase}
                data={items}
                onAdd={() => setView('NEW')}
                columns={[
                    { header: 'کد پروژه', accessor: (i: any) => i.trackingCode },
                    { header: 'عنوان پروژه', accessor: (i: any) => <span className="font-bold">{i.title}</span> },
                    { header: 'مدیر پروژه', accessor: (i: any) => i.manager },
                    { header: 'تاریخ شروع', accessor: (i: any) => i.startDate },
                    { header: 'بودجه (ریال)', accessor: (i: any) => Number(i.budget).toLocaleString() },
                    { header: 'پیشرفت', accessor: (i: any) => (
                        <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                                <span>{i.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${i.progress || 0}%` }}></div>
                            </div>
                        </div>
                    )},
                    { header: 'وضعیت', accessor: (i: any) => (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                            {i.status === 'PENDING' ? 'در حال اجرا' : 'تکمیل شده'}
                        </span>
                    )}
                ]}
              />
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
        <div className="flex items-center gap-2 mb-6">
             <Briefcase className="w-8 h-8 text-primary" />
             <h2 className="text-xl font-bold">تعریف و کنترل پروژه جدید</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1 font-medium">عنوان پروژه <span className="text-red-500">*</span></label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required className="w-full p-2.5 border rounded-xl dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="نام پروژه..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">مدیر پروژه <span className="text-red-500">*</span></label>
                <input 
                  value={formData.manager} 
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                  required className="w-full p-2.5 border rounded-xl dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="نام مسئول..."
                />
              </div>
              <div>
                 <ShamsiDatePicker 
                    label="تاریخ شروع"
                    value={formData.startDate || ''}
                    onChange={(d) => setFormData({...formData, startDate: d})}
                 />
              </div>
              <div>
                 <ShamsiDatePicker 
                    label="تاریخ پایان (تخمین)"
                    value={formData.endDate || ''}
                    onChange={(d) => setFormData({...formData, endDate: d})}
                 />
              </div>
               <div>
                  <label className="block text-sm mb-1 font-medium">بودجه مصوب (ریال) <span className="text-red-500">*</span></label>
                  <input 
                    type="number"
                    value={formData.budget} 
                    onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                    required className="w-full p-2.5 border rounded-xl dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
          </div>

          <div>
             <label className="block text-sm mb-1 font-medium">شرح اهداف و محدوده پروژه</label>
             <textarea 
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
               className="w-full p-3 border rounded-xl h-24 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
             ></textarea>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5"/> فازهای اجرایی (WBS)
              </h3>
              
              <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="عنوان فاز (مثلاً: فونداسیون)" 
                    className="flex-[2] p-2 border rounded-lg dark:bg-gray-700"
                    value={newMilestone.title}
                    onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="وزن %" 
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 text-center"
                    value={newMilestone.weight}
                    onChange={e => setNewMilestone({...newMilestone, weight: Number(e.target.value)})}
                  />
                  <button type="button" onClick={handleAddMilestone} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                      <Plus className="w-5 h-5" />
                  </button>
              </div>

              {milestones.length > 0 ? (
                  <div className="space-y-2">
                      <div className="grid grid-cols-12 text-xs text-gray-500 px-2">
                          <span className="col-span-8">شرح فعالیت</span>
                          <span className="col-span-2 text-center">وزن</span>
                          <span className="col-span-2 text-center">حذف</span>
                      </div>
                      {milestones.map(m => (
                          <div key={m.id} className="grid grid-cols-12 items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                              <span className="col-span-8 font-medium flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4 text-green-500" /> {m.title}
                              </span>
                              <span className="col-span-2 text-center bg-blue-50 text-blue-700 rounded px-1">{m.weight}%</span>
                              <div className="col-span-2 flex justify-center">
                                  <button type="button" onClick={() => removeMilestone(m.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))}
                      <div className="mt-2 text-left text-sm font-bold">
                          مجموع وزن: <span className={`${milestones.reduce((a,b)=>a+b.weight,0) === 100 ? 'text-green-600' : 'text-red-500'}`}>{milestones.reduce((a,b)=>a+b.weight,0)}%</span>
                      </div>
                  </div>
              ) : (
                  <p className="text-center text-gray-400 text-sm py-4">هنوز فازی تعریف نشده است.</p>
              )}
          </div>

          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={() => setView('LIST')} className="flex-1 border border-gray-300 dark:border-gray-600 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
                <X className="w-5 h-5" /> انصراف
            </button>
            <button type="submit" className="flex-[2] bg-primary text-white py-3 rounded-xl shadow-lg hover:bg-red-800 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> ایجاد پروژه و شروع گردش کار
            </button>
          </div>
        </form>
      </div>
  );
};
