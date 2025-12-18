import React, { useState } from 'react';
import { Mic, Save, Plus, Paperclip, Trash2, AlertTriangle, Share2, CheckCircle, Home, Copy } from 'lucide-react';
import { generateTrackingCode, compareShamsiDateTime, isFutureDate } from '../utils';
import { ShamsiDatePicker } from '../components/ShamsiDatePicker';
import { TimePicker24 } from '../components/TimePicker24';
import { useNavigate } from 'react-router-dom';

type Tab = 'GENERAL' | 'LABOR' | 'PARTS' | 'DOCS';

// Mock Master Data
const MOCK_EQUIPMENT = {
  'PM-101': { name: 'پمپ تغذیه بویلر' },
  'CV-202': { name: 'نوار نقاله اصلی' },
  'CR-300': { name: 'سنگ شکن فکی' },
};

export const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      equipCode: '',
      equipName: '',
      equipLocalName: '',
      productionLine: '',
      requester: 'علی محمدی',
      failureDesc: '',
      actionDesc: '',
      // Dates
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      // Metrics
      downtime: '',
      repairTime: ''
  });

  // Sub-lists State
  const [laborRows, setLaborRows] = useState<{id: string, name: string, hours: number}[]>([]);
  const [partRows, setPartRows] = useState<{id: string, name: string, qty: number}[]>([]);
  const [docRows, setDocRows] = useState<{id: string, name: string}[]>([]);

  // Handlers
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      const equip = MOCK_EQUIPMENT[code as keyof typeof MOCK_EQUIPMENT];
      
      setFormData(prev => ({
          ...prev,
          equipCode: code,
          equipName: equip ? equip.name : '',
      }));
  };

  const handleAddLabor = () => {
      setLaborRows([...laborRows, { id: Math.random().toString(), name: '', hours: 1 }]);
  };

  const handleAddPart = () => {
      setPartRows([...partRows, { id: Math.random().toString(), name: '', qty: 1 }]);
  };

  const handleAddDoc = () => {
      const fakeFiles = ['نقشه فنی.pdf', 'عکس خرابی.jpg', 'دستورالعمل.pdf'];
      const randomFile = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
      setDocRows([...docRows, { id: Math.random().toString(), name: randomFile }]);
  };

  const handleRemoveRow = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string) => {
      setter(prev => prev.filter(item => item.id !== id));
  };

  const validateForm = () => {
    // 1. Mandatory Fields Check
    if (!formData.equipCode || !formData.equipName || !formData.equipLocalName || !formData.productionLine) return "لطفا تمام مشخصات تجهیز را تکمیل کنید.";
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) return "لطفا زمان‌بندی کار را کامل وارد کنید.";
    if (!formData.failureDesc) return "شرح خرابی الزامی است.";
    if (!formData.actionDesc) return "اقدام صورت گرفته الزامی است.";
    if (!formData.downtime || !formData.repairTime) return "مدت توقف و زمان خالص تعمیر الزامی است.";

    // 2. Future Date Check
    if (isFutureDate(formData.startDate) || isFutureDate(formData.endDate)) {
        return "تاریخ شروع و پایان نمی‌تواند بزرگتر از تاریخ امروز باشد.";
    }

    // 3. Logic Check (End < Start)
    const comparison = compareShamsiDateTime(formData.startDate, formData.startTime, formData.endDate, formData.endTime);
    if (comparison === 1) { 
        return "تاریخ و ساعت اتمام نمی‌تواند قبل از تاریخ و ساعت شروع باشد.";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const error = validateForm();
    if (error) {
        setErrorMsg(error);
        setActiveTab('GENERAL'); // Switch to general tab to show error
        window.scrollTo(0,0);
        return;
    }

    const code = generateTrackingCode('W');
    setTrackingCode(code);
  };

  const getShareText = () => {
    let text = `🛠 *گزارش تعمیرات صبانور*\n\n` +
           `📌 کد پیگیری: ${trackingCode}\n` +
           `🏭 تجهیز: ${formData.equipName} (${formData.equipLocalName})\n` +
           `📍 خط: ${formData.productionLine}\n` +
           `⚠️ خرابی: ${formData.failureDesc}\n` +
           `🔧 اقدام: ${formData.actionDesc}\n` +
           `⏱ توقف: ${formData.downtime} دقیقه | خالص: ${formData.repairTime} دقیقه\n`;

    if (laborRows.length > 0) {
        text += `\n👷‍♂️ *نفرات:*\n` + laborRows.map(l => `- ${l.name || 'نامشخص'} (${l.hours}h)`).join('\n');
    }

    if (partRows.length > 0) {
        text += `\n⚙️ *قطعات:*\n` + partRows.map(p => `- ${p.name || 'نامشخص'} (${p.qty})`).join('\n');
    }
    
    return text;
  };

  const handleSmartShare = async () => {
      const text = getShareText();
      const shareData = {
          title: 'گزارش تعمیرات صبانور',
          text: text,
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.log('Share canceled');
          }
      } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(text).then(() => {
              setShareFeedback('گزارش کپی شد!');
              setTimeout(() => setShareFeedback(null), 2000);
          });
      }
  };

  if (trackingCode) {
      return (
          <div className="max-w-2xl mx-auto pt-8 pb-20 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                  <div className="bg-green-600 p-6 text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                          <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-1">گزارش با موفقیت ثبت شد</h2>
                      <p className="opacity-90 font-mono text-lg">{trackingCode}</p>
                  </div>

                  <div className="p-6 space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                          <div>
                              <span className="text-gray-500 block text-xs mb-1">تجهیز</span>
                              <span className="font-bold block">{formData.equipName}</span>
                              <span className="text-xs text-gray-400">({formData.equipLocalName})</span>
                          </div>
                          <div>
                              <span className="text-gray-500 block text-xs mb-1">خط تولید</span>
                              <span className="font-bold block">{formData.productionLine}</span>
                          </div>
                          <div>
                              <span className="text-gray-500 block text-xs mb-1">مدت توقف</span>
                              <span className="font-bold text-red-600">{formData.downtime} دقیقه</span>
                          </div>
                           <div>
                              <span className="text-gray-500 block text-xs mb-1">زمان تعمیر</span>
                              <span className="font-bold text-blue-600">{formData.repairTime} دقیقه</span>
                          </div>
                      </div>

                       {/* Action Desc */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm border-l-4 border-primary">
                          <span className="text-gray-500 block text-xs mb-1 font-bold">شرح اقدام:</span>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{formData.actionDesc}</p>
                      </div>

                      {/* Lists */}
                      {(laborRows.length > 0 || partRows.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {laborRows.length > 0 && (
                                  <div className="border rounded-lg p-3 text-sm dark:border-gray-700">
                                      <h4 className="font-bold mb-2 text-gray-500 text-xs uppercase">نفرات فنی</h4>
                                      <ul className="space-y-1">
                                          {laborRows.map((l, i) => (
                                              <li key={i} className="flex justify-between">
                                                  <span>{l.name || '-'}</span>
                                                  <span className="font-mono text-gray-400">{l.hours}h</span>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                              {partRows.length > 0 && (
                                  <div className="border rounded-lg p-3 text-sm dark:border-gray-700">
                                      <h4 className="font-bold mb-2 text-gray-500 text-xs uppercase">قطعات مصرفی</h4>
                                      <ul className="space-y-1">
                                          {partRows.map((p, i) => (
                                              <li key={i} className="flex justify-between">
                                                  <span>{p.name || '-'}</span>
                                                  <span className="font-mono text-gray-400">x{p.qty}</span>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="flex flex-col gap-3 mt-6">
                          <button 
                            onClick={handleSmartShare}
                            className="w-full bg-primary text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-red-800 transition shadow-lg shadow-red-900/20 active:scale-95"
                          >
                              {shareFeedback ? <CheckCircle className="w-5 h-5"/> : <Share2 className="w-5 h-5" />} 
                              {shareFeedback || 'اشتراک‌گذاری گزارش'}
                          </button>
                           <button 
                            onClick={() => navigate('/')}
                            className="w-full bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition"
                          >
                              <Home className="w-5 h-5" /> بازگشت به داشبورد
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const TabButton = ({ id, label }: { id: Tab; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabButton id="GENERAL" label="اطلاعات اصلی" />
          <TabButton id="LABOR" label="نیروی انسانی" />
          <TabButton id="PARTS" label="قطعات مصرفی" />
          <TabButton id="DOCS" label="مستندات" />
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start gap-3 text-sm animate-pulse border border-red-100">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
              </div>
          )}

          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              {/* Equipment Info Section */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-2">مشخصات تجهیز (اجباری)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                            کد تجهیز <span className="text-red-500">*</span>
                        </label>
                        <select 
                            required
                            value={formData.equipCode}
                            onChange={handleEquipmentChange}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        >
                            <option value="">انتخاب کنید</option>
                            {Object.entries(MOCK_EQUIPMENT).map(([code, equip]) => (
                                <option key={code} value={code}>{code} - {equip.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">نام تجهیز</label>
                        <input 
                            type="text" 
                            readOnly 
                            value={formData.equipName}
                            className="w-full p-2.5 border rounded-xl bg-gray-200 dark:bg-gray-600 cursor-not-allowed opacity-70" 
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">نام محلی <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required
                            value={formData.equipLocalName}
                            onChange={(e) => setFormData({...formData, equipLocalName: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="نام رایج در کارخانه..."
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">خط تولید <span className="text-red-500">*</span></label>
                        <select 
                            required
                            value={formData.productionLine}
                            onChange={(e) => setFormData({...formData, productionLine: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" 
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="Line A">Line A</option>
                            <option value="Line B">Line B</option>
                            <option value="Line A&B">Line A&B</option>
                        </select>
                    </div>
                  </div>
              </div>

              {/* Timing Section */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                   <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">زمان‌بندی کار (اجباری)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="grid grid-cols-2 gap-3">
                           <div className="col-span-2 md:col-span-1">
                               <ShamsiDatePicker 
                                   label="تاریخ شروع" 
                                   value={formData.startDate} 
                                   onChange={(d) => setFormData({...formData, startDate: d})} 
                               />
                           </div>
                           <div className="col-span-2 md:col-span-1">
                               <TimePicker24
                                   label="ساعت شروع"
                                   value={formData.startTime}
                                   onChange={(t) => setFormData({...formData, startTime: t})}
                               />
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                           <div className="col-span-2 md:col-span-1">
                               <ShamsiDatePicker 
                                   label="تاریخ پایان" 
                                   value={formData.endDate} 
                                   onChange={(d) => setFormData({...formData, endDate: d})} 
                               />
                           </div>
                           <div className="col-span-2 md:col-span-1">
                               <TimePicker24
                                   label="ساعت پایان"
                                   value={formData.endTime}
                                   onChange={(t) => setFormData({...formData, endTime: t})}
                               />
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100 dark:border-blue-800">
                       <div>
                           <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">مدت توقف (دقیقه)</label>
                           <input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              required
                              value={formData.downtime}
                              onChange={(e) => setFormData({...formData, downtime: e.target.value})}
                              className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none text-center"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">زمان خالص تعمیر (دقیقه)</label>
                           <input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              required
                              value={formData.repairTime}
                              onChange={(e) => setFormData({...formData, repairTime: e.target.value})}
                              className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                           />
                       </div>
                   </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">شرح خرابی <span className="text-red-500">*</span></label>
                <div className="relative">
                    <textarea 
                        required
                        className="w-full p-4 border rounded-xl bg-gray-50 dark:bg-gray-700 h-28 pl-10 focus:ring-2 focus:ring-primary outline-none border-gray-200 dark:border-gray-600 resize-none"
                        placeholder="توضیحات خرابی را وارد کنید..."
                        value={formData.failureDesc}
                        onChange={(e) => setFormData({...formData, failureDesc: e.target.value})}
                    ></textarea>
                    <button type="button" className="absolute left-2 bottom-2 p-2 text-gray-400 hover:text-primary transition">
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">اقدام صورت گرفته <span className="text-red-500">*</span></label>
                <div className="relative">
                    <textarea 
                        required
                        className="w-full p-4 border rounded-xl bg-gray-50 dark:bg-gray-700 h-28 pl-10 focus:ring-2 focus:ring-primary outline-none border-gray-200 dark:border-gray-600 resize-none"
                        placeholder="شرح کامل تعمیرات..."
                        value={formData.actionDesc}
                        onChange={(e) => setFormData({...formData, actionDesc: e.target.value})}
                    ></textarea>
                    <button type="button" className="absolute left-2 bottom-2 p-2 text-gray-400 hover:text-primary transition">
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LABOR' && (
              <div className="space-y-4">
                  {laborRows.map((row, idx) => (
                      <div key={row.id} className="flex gap-2 items-end bg-gray-50 dark:bg-gray-700 p-3 rounded-lg animate-fadeIn">
                          <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">نام تکنسین</label>
                              <select 
                                onChange={(e) => {
                                    const newRows = [...laborRows];
                                    newRows[idx].name = e.target.value;
                                    setLaborRows(newRows);
                                }}
                                className="w-full p-2 border rounded dark:bg-gray-800"
                              >
                                  <option value="">انتخاب...</option>
                                  <option value="علی رضایی">علی رضایی (مکانیک)</option>
                                  <option value="حسن پارسا">حسن پارسا (برق)</option>
                                  <option value="رضا حسینی">رضا حسینی (جوشکار)</option>
                              </select>
                          </div>
                          <div className="w-24">
                              <label className="text-xs text-gray-500 mb-1 block">ساعت کار</label>
                              <input 
                                type="number" 
                                defaultValue={row.hours}
                                onChange={(e) => {
                                    const newRows = [...laborRows];
                                    newRows[idx].hours = Number(e.target.value);
                                    setLaborRows(newRows);
                                }}
                                className="w-full p-2 border rounded dark:bg-gray-800" 
                              />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveRow(setLaborRows, row.id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded mb-[2px]"
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={handleAddLabor}
                    className="w-full flex items-center justify-center gap-2 text-primary border-2 border-dashed border-primary/30 px-4 py-3 rounded-lg hover:bg-primary/5 transition"
                  >
                      <Plus className="w-4 h-4" /> افزودن نیروی کار
                  </button>
              </div>
          )}

           {activeTab === 'PARTS' && (
              <div className="space-y-4">
                  {partRows.map((row, idx) => (
                      <div key={row.id} className="flex gap-2 items-end bg-gray-50 dark:bg-gray-700 p-3 rounded-lg animate-fadeIn">
                          <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">نام قطعه</label>
                              <input 
                                type="text" 
                                placeholder="جستجو کد یا نام..." 
                                onChange={(e) => {
                                    const newRows = [...partRows];
                                    newRows[idx].name = e.target.value;
                                    setPartRows(newRows);
                                }}
                                className="w-full p-2 border rounded dark:bg-gray-800" 
                               />
                          </div>
                          <div className="w-24">
                              <label className="text-xs text-gray-500 mb-1 block">تعداد</label>
                              <input 
                                type="number" 
                                defaultValue={row.qty} 
                                onChange={(e) => {
                                    const newRows = [...partRows];
                                    newRows[idx].qty = Number(e.target.value);
                                    setPartRows(newRows);
                                }}
                                className="w-full p-2 border rounded dark:bg-gray-800" 
                              />
                          </div>
                           <button 
                            type="button" 
                            onClick={() => handleRemoveRow(setPartRows, row.id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded mb-[2px]"
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                  ))}
                   <button 
                    type="button" 
                    onClick={handleAddPart}
                    className="w-full flex items-center justify-center gap-2 text-primary border-2 border-dashed border-primary/30 px-4 py-3 rounded-lg hover:bg-primary/5 transition"
                  >
                      <Plus className="w-4 h-4" /> افزودن قطعه مصرفی
                  </button>
              </div>
          )}

           {activeTab === 'DOCS' && (
              <div className="space-y-6">
                   <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={handleAddDoc}>
                      <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2 font-medium">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
                      <span className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</span>
                  </div>

                  {docRows.length > 0 && (
                      <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-500">فایل‌های پیوست شده:</h4>
                          {docRows.map(doc => (
                              <div key={doc.id} className="flex justify-between items-center bg-white dark:bg-gray-700 border p-3 rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3">
                                      <div className="bg-blue-100 text-blue-600 p-2 rounded">
                                          <Paperclip className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
                                  </div>
                                  <button type="button" onClick={() => handleRemoveRow(setDocRows, doc.id)} className="text-red-500 hover:text-red-700">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button 
                type="submit" 
                className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg shadow-red-900/20 flex items-center gap-2 hover:bg-red-800 transition transform active:scale-95"
              >
                  <Save className="w-5 h-5" />
                  ثبت نهایی گزارش
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};