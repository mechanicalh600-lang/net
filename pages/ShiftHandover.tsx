
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { 
  Clipboard, Save, Users, Factory, Activity, 
  Droplet, Layers, Wrench, Mic, Loader2, PlayCircle, StopCircle, Clock, Share2, CheckCircle, Printer, ArrowRight,
  Coffee, UserCheck, UserX, Trash2, Plus, Magnet, Home
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getShamsiDate, getTime, generateTrackingCode, parseShamsiDate } from '../utils';
import { startWorkflow, fetchMasterData } from '../workflowStore';
import { ShamsiDatePicker } from '../components/ShamsiDatePicker';
import { ClockTimePicker } from '../components/ClockTimePicker';
import { ClothGrid } from '../components/ClothGrid';
import { Logo } from '../components/Logo';

interface Props {
  user: User;
}

const PRODUCTION_TIMES = [
    "07:30", "08:30", "09:30", "10:30", "11:30", "12:30",
    "01:30", "02:30", "03:30", "04:30", "05:30", "06:30"
];

const BALL_SIZES = ["25", "30", "40", "50", "60", "70", "80", "90", "100"];

const SHIFT_TYPES: Record<string, string> = {
    'Day1': 'روزکار اول',
    'Day2': 'روزکار دوم',
    'Night1': 'شب‌کار اول',
    'Night2': 'شب‌کار دوم'
};

const NUM_TO_WORD = ['یک', 'دو', 'سه', 'چهار', 'پنج'];

const DRUM_TYPES = [
    { key: 'single', label: 'درام تکی' },
    { key: 'upper', label: 'درام طبقاتی بالایی' },
    { key: 'middle', label: 'درام طبقاتی میانی' },
    { key: 'lower', label: 'درام طبقاتی پایینی' },
];

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'REST';

export const ShiftHandover: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  
  // --- Master Data ---
  const [personnel, setPersonnel] = useState<any[]>([]);

  // --- Form State ---
  const [shiftInfo, setShiftInfo] = useState({
      name: 'A',
      type: 'Day1', // Day1, Day2, Night1, Night2
      date: getShamsiDate(),
      supervisor: user.id
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  const [production, setProduction] = useState<{
      lineA: Record<string, number>,
      lineB: Record<string, number>
  }>({ lineA: {}, lineB: {} });

  const [feedTypes, setFeedTypes] = useState<{
      lineA: Record<string, string>,
      lineB: Record<string, string>
  }>({ lineA: {}, lineB: {} });

  const [ballMills, setBallMills] = useState({
      lineA: {
          primary: { active: false, amp08: '', amp02: '', dens08: '', dens02: '', balls: [] as {size: string, count: number}[] },
          secondary: { active: false, amp08: '', amp02: '', dens08: '', dens02: '', balls: [] as {size: string, count: number}[] }
      },
      lineB: {
           primary: { active: false, amp08: '', amp02: '', dens08: '', dens02: '', balls: [] as {size: string, count: number}[] },
           secondary: { active: false, amp08: '', amp02: '', dens08: '', dens02: '', balls: [] as {size: string, count: number}[] }
      }
  });

  const [concentrateFilters, setConcentrateFilters] = useState({
      lineA: { active: false, operator: '', hours: '', cloths: [] as string[] },
      lineB: { active: false, operator: '', hours: '', cloths: [] as string[] },
      reserve: { active: false, operator: '', hours: '', cloths: [] as string[] }
  });

  const [hydrocyclones, setHydrocyclones] = useState({
      lineA: {
          primary: { inCircuit: false, activeCyclones: [] as number[], pressure: '', angle: '' },
          secondary: { inCircuit: false, activeCyclones: [] as number[], pressure: '', angle: '' }
      },
      lineB: {
          primary: { inCircuit: false, activeCyclones: [] as number[], pressure: '', angle: '' },
          secondary: { inCircuit: false, activeCyclones: [] as number[], pressure: '', angle: '' }
      }
  });

  const [thickeners, setThickeners] = useState({
      lineA: [
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' }, // T1
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' }, // T2
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' }, // T3
      ],
      lineB: [
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' },
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' },
          { active: false, pressure: '', jackHeight: '', output: '', channelOutput: '' },
      ]
  });

  const [drumMagnets, setDrumMagnets] = useState({
      lineA: { single: false, upper: false, middle: false, lower: false },
      lineB: { single: false, upper: false, middle: false, lower: false }
  });

  const [recoveryFilters, setRecoveryFilters] = useState({
      lineA: [
          { active: false, operator: '', hours: '', cloths: [] as string[] }, // F1
          { active: false, operator: '', hours: '', cloths: [] as string[] }  // F2
      ],
      lineB: [
          { active: false, operator: '', hours: '', cloths: [] as string[] },
          { active: false, operator: '', hours: '', cloths: [] as string[] }
      ]
  });

  const [pumps, setPumps] = useState({
      process: [] as string[], // ["FWP1", "FWP3"]
      cleanWater: [] as string[]
  });

  const [downtime, setDowntime] = useState({
      lineA: { workTime: '', stopTime: '', reason: '' },
      lineB: { workTime: '', stopTime: '', reason: '' }
  });

  const [footer, setFooter] = useState({
      nextShiftActions: ''
  });

  // --- Effects ---
  useEffect(() => {
      fetchMasterData('personnel').then(data => {
          setPersonnel(data);
          setAttendanceMap({});
      });
  }, []);

  // Auto-print effect
  useEffect(() => {
    if (submittedReport) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [submittedReport]);

  // --- Handlers ---
  const handleTonnageChange = (line: 'lineA' | 'lineB', time: string, val: string) => {
      setProduction(prev => ({
          ...prev,
          [line]: { ...prev[line], [time]: Number(val) }
      }));
  };

  const handleFeedTypeChange = (line: 'lineA' | 'lineB', time: string, val: string) => {
      setFeedTypes(prev => ({
          ...prev,
          [line]: { ...prev[line], [time]: val }
      }));
  };

  const calculateTotalTonnage = (line: 'lineA' | 'lineB') => {
      return Object.values(production[line]).reduce((a: number, b: number) => a + b, 0);
  };

  const addPersonnelStatus = (id: string, status: AttendanceStatus) => {
      if (!id) return;
      setAttendanceMap(prev => ({ ...prev, [id]: status }));
  };

  const removePersonnelStatus = (id: string) => {
      const newMap = { ...attendanceMap };
      delete newMap[id];
      setAttendanceMap(newMap);
  };

  const handleVoiceInput = (setter: (val: string) => void, fieldName: string) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert('مرورگر پشتیبانی نمی‌کند.');
          return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.onstart = () => setListeningField(fieldName);
      recognition.onend = () => setListeningField(null);
      recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setter(text); // For simple text fields
      };
      recognition.start();
  };
  
  const handleNextShiftActionsVoice = () => {
       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
       if (!SpeechRecognition) return;
       const recognition = new SpeechRecognition();
       recognition.lang = 'fa-IR';
       recognition.onstart = () => setListeningField('nextShift');
       recognition.onend = () => setListeningField(null);
       recognition.onresult = (e: any) => {
           const text = e.results[0][0].transcript;
           setFooter(prev => ({ ...prev, nextShiftActions: prev.nextShiftActions + ' ' + text }));
       };
       recognition.start();
  }

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `گزارش شیفت ${submittedReport.shiftInfo.name}`,
                  text: `تولید خط A: ${submittedReport.totalA} تن\nتولید خط B: ${submittedReport.totalB} تن`,
              });
          } catch (err) {
              console.log('Error sharing', err);
          }
      } else {
          alert('مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند.');
      }
  };

  const timeToMinutes = (t: string) => {
      if(!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h * 60) + m;
  };

  const minutesToTime = (totalMinutes: number) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  const getDayOfWeek = (dateStr: string) => {
      const date = parseShamsiDate(dateStr);
      if (!date) return '';
      const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      return days[date.getDay()];
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Confirmation Dialog
      if (!window.confirm("آیا از ثبت نهایی گزارش شیفت اطمینان دارید؟")) {
          return;
      }
      
      // Validations
      if (downtime.lineA.stopTime !== '' && downtime.lineA.stopTime !== '00:00' && !downtime.lineA.reason) {
          alert("لطفا علت توقف خط A را وارد کنید.");
          return;
      }
      if (downtime.lineB.stopTime !== '' && downtime.lineB.stopTime !== '00:00' && !downtime.lineB.reason) {
          alert("لطفا علت توقف خط B را وارد کنید.");
          return;
      }

      setIsSubmitting(true);
      // New Tracking Code Format: T + YY + MM + XXXXX
      const code = generateTrackingCode('T');
      
      // Calculate Attendance stats for report
      const presentIds = Object.keys(attendanceMap).filter(id => attendanceMap[id] === 'PRESENT');
      const absentIds = Object.keys(attendanceMap).filter(id => attendanceMap[id] === 'ABSENT');
      const restIds = Object.keys(attendanceMap).filter(id => attendanceMap[id] === 'REST');

      const reportData = {
          code, // Save unique code in report data
          shiftInfo,
          attendance: {
              present: presentIds,
              absent: absentIds,
              rest: restIds,
              map: attendanceMap
          },
          production,
          feedTypes,
          ballMills,
          concentrateFilters,
          hydrocyclones,
          thickeners,
          drumMagnets,
          recoveryFilters,
          pumps,
          downtime,
          footer,
          totalA: calculateTotalTonnage('lineA'),
          totalB: calculateTotalTonnage('lineB')
      };

      startWorkflow('SHIFT_REPORT', reportData, user, code, `گزارش شیفت ${shiftInfo.name} - ${shiftInfo.date}`);
      
      setTimeout(() => {
          setSubmittedReport(reportData); // Show receipt view
          setIsSubmitting(false);
          window.scrollTo(0,0);
      }, 1500);
  };

  // --- Render Helpers ---
  const OperatorSelect = ({ value, onChange, label }: any) => (
      <div>
          <label className="block text-xs font-bold mb-1">{label}</label>
          <select 
            value={value} 
            onChange={e => onChange(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-sm"
          >
              <option value="">انتخاب اپراتور...</option>
              {personnel.filter(p => attendanceMap[p.id] === 'PRESENT').map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
          </select>
      </div>
  );

  const getAvailablePersonnel = () => {
      return personnel.filter(p => !attendanceMap[p.id]);
  };

  const getPersonnelByStatus = (status: AttendanceStatus) => {
      return personnel.filter(p => attendanceMap[p.id] === status);
  };

  if (submittedReport) {
      // (Receipt View Logic)
      const shiftLength = 720; // 12 Hours in minutes
      
      // Calculate Times
      const stopMinutesA = timeToMinutes(submittedReport.downtime.lineA.stopTime || '00:00');
      const workMinutesA = Math.max(0, shiftLength - stopMinutesA);
      
      const stopMinutesB = timeToMinutes(submittedReport.downtime.lineB.stopTime || '00:00');
      const workMinutesB = Math.max(0, shiftLength - stopMinutesB);
      
      const pieDataA = [
          { name: 'کارکرد', value: workMinutesA, fill: '#22c55e' }, // Green
          { name: 'توقف', value: stopMinutesA, fill: '#ef4444' }   // Red
      ];
      const pieDataB = [
          { name: 'کارکرد', value: workMinutesB, fill: '#22c55e' }, // Green
          { name: 'توقف', value: stopMinutesB, fill: '#ef4444' }   // Red
      ];

      // Bar Chart Data
      const barData = PRODUCTION_TIMES.map(t => ({
          name: t,
          LineA: submittedReport.production.lineA[t] || 0,
          LineB: submittedReport.production.lineB[t] || 0
      }));

      // Cloth Count
      const totalConcentrateCloths = 
          (submittedReport.concentrateFilters.lineA.active ? submittedReport.concentrateFilters.lineA.cloths.length : 0) +
          (submittedReport.concentrateFilters.lineB.active ? submittedReport.concentrateFilters.lineB.cloths.length : 0) +
          (submittedReport.concentrateFilters.reserve.active ? submittedReport.concentrateFilters.reserve.cloths.length : 0);
          
      const totalRecoveryCloths = 
          submittedReport.recoveryFilters.lineA.reduce((sum: number, f: any) => sum + (f.active ? f.cloths.length : 0), 0) +
          submittedReport.recoveryFilters.lineB.reduce((sum: number, f: any) => sum + (f.active ? f.cloths.length : 0), 0);

      return (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20 pt-6 px-4 font-sans flex flex-col items-center">
              {/* A4 Container: 210mm x 297mm */}
              <div className="w-[210mm] min-h-[297mm] bg-white dark:bg-gray-800 shadow-2xl rounded-sm overflow-hidden animate-slideUp print:shadow-none print:w-full print:h-auto relative">
                  
                  {/* ... Header ... */}
                  <div className="border-b-4 border-primary p-6 relative bg-white dark:bg-gray-900">
                      {/* Logo Top Left */}
                      <div className="absolute top-4 left-6 w-24 h-24">
                          <Logo className="w-full h-full object-contain" />
                      </div>

                      {/* Center Title */}
                      <div className="text-center pt-2 pb-4 px-20">
                          <h1 className="text-2xl font-black text-[#800020] dark:text-red-400 leading-tight">شرکت توسعه معدنی و صنعتی صبانور</h1>
                          <p className="text-sm text-gray-500 font-bold tracking-[0.2em] mt-2 uppercase">گزارش شیفت تولید کارخانه کنسانتره اسدآباد</p>
                      </div>

                      {/* Date Info Top Right */}
                      <div className="absolute top-6 right-6 text-left text-sm space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between w-40 border-b border-gray-200 pb-1">
                              <span className="text-gray-500 text-xs">تاریخ:</span>
                              <span className="font-mono font-bold text-xs">{submittedReport.shiftInfo.date}</span>
                          </div>
                          <div className="flex justify-between w-40 border-b border-gray-200 pb-1">
                              <span className="text-gray-500 text-xs">شیفت:</span>
                              <span className="font-bold text-xs">{submittedReport.shiftInfo.name} ({SHIFT_TYPES[submittedReport.shiftInfo.type]})</span>
                          </div>
                          <div className="flex justify-between w-40">
                              <span className="text-gray-500 text-xs">کد رهگیری:</span>
                              <span className="font-mono font-bold text-primary text-xs">{submittedReport.code}</span>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 space-y-8">
                      {/* Production & Personnel Summary */}
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                              <span className="block text-xs text-blue-600 dark:text-blue-300 font-bold mb-1">خوراک مصرفی خط A</span>
                              <span className="text-3xl font-black text-gray-800 dark:text-white">{submittedReport.totalA}</span>
                              <span className="text-xs text-gray-500 block">تن</span>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center border border-red-100 dark:border-red-800">
                              <span className="block text-xs text-red-600 dark:text-red-300 font-bold mb-1">خوراک مصرفی خط B</span>
                              <span className="text-3xl font-black text-gray-800 dark:text-white">{submittedReport.totalB}</span>
                              <span className="text-xs text-gray-500 block">تن</span>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-100 dark:border-green-800">
                              <span className="block text-xs text-green-600 dark:text-green-300 font-bold mb-1">پرسنل شیفت</span>
                              <div className="flex justify-center gap-4 text-sm mt-1">
                                  <span className="text-green-600 font-bold">{submittedReport.attendance.present.length} حاضر</span>
                                  <span className="text-red-600 font-bold">{submittedReport.attendance.absent.length} غایب</span>
                              </div>
                          </div>
                      </div>

                      {/* Hourly Production Chart */}
                      <div className="border rounded-xl p-4">
                          <h3 className="text-xs font-bold text-gray-500 text-center mb-4">نمودار مصرف خوراک (تناژ/ساعت)</h3>
                          <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={barData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                      <XAxis dataKey="name" tick={{fontSize: 10}} />
                                      <YAxis tick={{fontSize: 10}} />
                                      <RechartsTooltip />
                                      <Legend />
                                      <Bar dataKey="LineA" name="خط A" fill="#3b82f6" radius={[4,4,0,0]} />
                                      <Bar dataKey="LineB" name="خط B" fill="#ef4444" radius={[4,4,0,0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Charts Section (Pie Charts for Line Status) */}
                      <div className="grid grid-cols-2 gap-8">
                          {/* Line A Chart */}
                          <div className="bg-white dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm flex flex-col items-center">
                              <h3 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200 w-full text-center border-b pb-2">وضعیت عملکرد خط A</h3>
                              <div className="h-40 w-full relative">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                          <Pie
                                              data={pieDataA}
                                              cx="50%"
                                              cy="50%"
                                              innerRadius={0} // Full Pie
                                              outerRadius={60}
                                              paddingAngle={2}
                                              dataKey="value"
                                              stroke="none"
                                          >
                                              {pieDataA.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                              ))}
                                          </Pie>
                                          <RechartsTooltip />
                                      </PieChart>
                                  </ResponsiveContainer>
                              </div>
                              <div className="flex justify-between w-full px-4 mt-2 text-sm">
                                  <div className="flex flex-col items-center">
                                      <span className="flex items-center gap-1 font-bold text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> کارکرد</span>
                                      <span className="font-mono">{minutesToTime(workMinutesA)}</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="flex items-center gap-1 font-bold text-red-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> توقف</span>
                                      <span className="font-mono">{submittedReport.downtime.lineA.stopTime || '00:00'}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Line B Chart */}
                          <div className="bg-white dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm flex flex-col items-center">
                              <h3 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200 w-full text-center border-b pb-2">وضعیت عملکرد خط B</h3>
                              <div className="h-40 w-full relative">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                          <Pie
                                              data={pieDataB}
                                              cx="50%"
                                              cy="50%"
                                              innerRadius={0} // Full Pie
                                              outerRadius={60}
                                              paddingAngle={2}
                                              dataKey="value"
                                              stroke="none"
                                          >
                                              {pieDataB.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                              ))}
                                          </Pie>
                                          <RechartsTooltip />
                                      </PieChart>
                                  </ResponsiveContainer>
                              </div>
                              <div className="flex justify-between w-full px-4 mt-2 text-sm">
                                  <div className="flex flex-col items-center">
                                      <span className="flex items-center gap-1 font-bold text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> کارکرد</span>
                                      <span className="font-mono">{minutesToTime(workMinutesB)}</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="flex items-center gap-1 font-bold text-red-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> توقف</span>
                                      <span className="font-mono">{submittedReport.downtime.lineB.stopTime || '00:00'}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Ball Mill Table - Only Show Active */}
                      <div className="border rounded-xl overflow-hidden">
                          <div className="bg-gray-100 p-2 text-center text-xs font-bold text-gray-600">پارامترهای بالمیل ها</div>
                          <table className="w-full text-center text-xs">
                              <thead>
                                  <tr className="border-b bg-gray-50">
                                      <th className="p-2">تجهیز</th>
                                      <th className="p-2">جریان (A)</th>
                                      <th className="p-2">دانسیته</th>
                                      <th className="p-2">شارژ گلوله</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y">
                                  {submittedReport.ballMills.lineA.primary.active && (
                                      <tr>
                                          <td className="p-2 font-bold text-blue-600">بالمیل یک خط A</td>
                                          <td className="p-2">{submittedReport.ballMills.lineA.primary.amp08} / {submittedReport.ballMills.lineA.primary.amp02}</td>
                                          <td className="p-2">{submittedReport.ballMills.lineA.primary.dens08} / {submittedReport.ballMills.lineA.primary.dens02}</td>
                                          <td className="p-2">
                                              {submittedReport.ballMills.lineA.primary.balls.map((b:any, i:number) => (
                                                  <div key={i}>سایز {b.size}: {b.count} بشکه</div>
                                              ))}
                                          </td>
                                      </tr>
                                  )}
                                  {submittedReport.ballMills.lineA.secondary.active && (
                                      <tr>
                                          <td className="p-2 font-bold text-blue-600">بالمیل دو خط A</td>
                                          <td className="p-2">{submittedReport.ballMills.lineA.secondary.amp08} / {submittedReport.ballMills.lineA.secondary.amp02}</td>
                                          <td className="p-2">{submittedReport.ballMills.lineA.secondary.dens08} / {submittedReport.ballMills.lineA.secondary.dens02}</td>
                                          <td className="p-2">
                                              {submittedReport.ballMills.lineA.secondary.balls.map((b:any, i:number) => (
                                                  <div key={i}>سایز {b.size}: {b.count} بشکه</div>
                                              ))}
                                          </td>
                                      </tr>
                                  )}
                                  {submittedReport.ballMills.lineB.primary.active && (
                                       <tr>
                                          <td className="p-2 font-bold text-red-800">بالمیل یک خط B</td>
                                          <td className="p-2">{submittedReport.ballMills.lineB.primary.amp08} / {submittedReport.ballMills.lineB.primary.amp02}</td>
                                          <td className="p-2">{submittedReport.ballMills.lineB.primary.dens08} / {submittedReport.ballMills.lineB.primary.dens02}</td>
                                          <td className="p-2">
                                              {submittedReport.ballMills.lineB.primary.balls.map((b:any, i:number) => (
                                                  <div key={i}>سایز {b.size}: {b.count} بشکه</div>
                                              ))}
                                          </td>
                                      </tr>
                                  )}
                                  {submittedReport.ballMills.lineB.secondary.active && (
                                      <tr>
                                          <td className="p-2 font-bold text-red-800">بالمیل دو خط B</td>
                                          <td className="p-2">{submittedReport.ballMills.lineB.secondary.amp08} / {submittedReport.ballMills.lineB.secondary.amp02}</td>
                                          <td className="p-2">{submittedReport.ballMills.lineB.secondary.dens08} / {submittedReport.ballMills.lineB.secondary.dens02}</td>
                                          <td className="p-2">
                                              {submittedReport.ballMills.lineB.secondary.balls.map((b:any, i:number) => (
                                                  <div key={i}>سایز {b.size}: {b.count} بشکه</div>
                                              ))}
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>

                      {/* Drum Magnets & Thickeners Summary */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-xl overflow-hidden">
                              <div className="bg-gray-100 p-2 text-center text-xs font-bold text-gray-600">درام مگنت‌های فعال</div>
                              <div className="p-4 text-xs space-y-2">
                                  <div>
                                      <span className="font-bold block text-blue-600 mb-1">خط A:</span>
                                      <div className="flex flex-wrap gap-1">
                                          {DRUM_TYPES.map(d => submittedReport.drumMagnets.lineA[d.key] && (
                                              <span key={d.key} className="bg-blue-50 px-2 py-1 rounded">{d.label}</span>
                                          ))}
                                          {!Object.values(submittedReport.drumMagnets.lineA).some(Boolean) && <span className="text-gray-400">-</span>}
                                      </div>
                                  </div>
                                  <div>
                                      <span className="font-bold block text-red-600 mb-1">خط B:</span>
                                      <div className="flex flex-wrap gap-1">
                                          {DRUM_TYPES.map(d => submittedReport.drumMagnets.lineB[d.key] && (
                                              <span key={d.key} className="bg-red-50 px-2 py-1 rounded">{d.label}</span>
                                          ))}
                                          {!Object.values(submittedReport.drumMagnets.lineB).some(Boolean) && <span className="text-gray-400">-</span>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="border rounded-xl overflow-hidden">
                              <div className="bg-gray-100 p-2 text-center text-xs font-bold text-gray-600">کارکرد تیکنرها</div>
                              <div className="p-4 text-xs">
                                  <div className="grid grid-cols-3 gap-2 text-center mb-2 font-bold text-gray-400">
                                      <span>تجهیز</span>
                                      <span>کارکرد</span>
                                      <span>خروجی کانال</span>
                                  </div>
                                  <div className="space-y-1">
                                      {submittedReport.thickeners.lineA.map((t: any, i: number) => t.active && (
                                          <div key={`A-${i}`} className="grid grid-cols-3 gap-2 text-center border-b pb-1 last:border-0">
                                              <span className="text-blue-600">تیکنر {NUM_TO_WORD[i]} A</span>
                                              <span>{t.output || '-'}</span>
                                              <span>{t.channelOutput || '-'}</span>
                                          </div>
                                      ))}
                                      {submittedReport.thickeners.lineB.map((t: any, i: number) => t.active && (
                                          <div key={`B-${i}`} className="grid grid-cols-3 gap-2 text-center border-b pb-1 last:border-0">
                                              <span className="text-red-600">تیکنر {NUM_TO_WORD[i]} B</span>
                                              <span>{t.output || '-'}</span>
                                              <span>{t.channelOutput || '-'}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Filters & Downtime */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <span className="block text-xs font-bold text-gray-500 mb-2">تعویض پارچه فیلترها</span>
                              <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                      <span>کنسانتره:</span>
                                      <span className="font-bold">{totalConcentrateCloths} عدد</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span>بازیافت:</span>
                                      <span className="font-bold">{totalRecoveryCloths} عدد</span>
                                  </div>
                              </div>
                          </div>
                          
                          {(submittedReport.downtime.lineA.reason || submittedReport.downtime.lineB.reason) && (
                              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                  <span className="block text-xs font-bold text-red-600 mb-2">علت توقفات</span>
                                  <div className="text-xs space-y-2">
                                      {submittedReport.downtime.lineA.reason && (
                                          <div>
                                              <span className="font-bold">خط A:</span> {submittedReport.downtime.lineA.reason}
                                          </div>
                                      )}
                                      {submittedReport.downtime.lineB.reason && (
                                          <div>
                                              <span className="font-bold">خط B:</span> {submittedReport.downtime.lineB.reason}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* Footer Actions */}
                      {submittedReport.footer.nextShiftActions && (
                          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs mt-4">
                              <span className="font-bold text-yellow-800 block mb-1">یادداشت برای شیفت بعد:</span>
                              {submittedReport.footer.nextShiftActions}
                          </div>
                      )}
                  </div>
              </div>
              
              {/* Action Bar */}
              <div className="w-[210mm] mt-6 flex gap-4 print:hidden mb-20">
                  <button onClick={handleShare} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg transition">
                      <Share2 className="w-5 h-5" /> اشتراک گذاری
                  </button>
                  <button onClick={() => window.print()} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition">
                      <Printer className="w-5 h-5" /> چاپ گزارش
                  </button>
                  <button onClick={() => navigate('/')} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 shadow-lg transition">
                      <Home className="w-5 h-5" /> بازگشت به خانه
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      <div className="flex items-center gap-2 mb-6 pt-6">
         <div className="bg-primary/10 p-2 rounded-lg">
            <Clipboard className="w-8 h-8 text-primary" />
         </div>
         <div>
            <h1 className="text-2xl font-bold">گزارش تولید و نوبت کاری</h1>
            <p className="text-xs text-gray-500">ثبت اطلاعات فرآیند، پرسنل و تجهیزات</p>
         </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
         {[
             { id: 1, label: 'اطلاعات و پرسنل', icon: Users },
             { id: 2, label: 'خوراک (تناژ)', icon: Factory },
             { id: 3, label: 'بالمیل', icon: Activity },
             { id: 4, label: 'هیدروسیکلون', icon: Droplet },
             { id: 9, label: 'درام مگنت', icon: Magnet }, // Added
             { id: 6, label: 'فیلتر کنسانتره', icon: Wrench },
             { id: 5, label: 'تیکنر', icon: Layers },
             { id: 7, label: 'فیلتر بازیافت', icon: Wrench },
             { id: 8, label: 'توقفات و پمپ', icon: StopCircle },
         ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all
                    ${activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}
                `}
             >
                 <tab.icon className="w-4 h-4" /> {tab.label}
             </button>
         ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[500px]">
          
          {/* TAB 1: General & Personnel */}
          {activeTab === 1 && (
             <div className="space-y-8 animate-fadeIn">
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                     <div>
                         <label className="block text-sm font-bold mb-2">شیفت</label>
                         <select 
                            className="w-full p-3 rounded-xl border outline-none"
                            value={shiftInfo.name}
                            onChange={e => setShiftInfo({...shiftInfo, name: e.target.value})}
                         >
                             <option value="A">شیفت A</option>
                             <option value="B">شیفت B</option>
                             <option value="C">شیفت C</option>
                         </select>
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">نوبت کاری</label>
                         <select 
                            className="w-full p-3 rounded-xl border outline-none"
                            value={shiftInfo.type}
                            onChange={e => setShiftInfo({...shiftInfo, type: e.target.value})}
                         >
                             <option value="Day1">روزکار اول</option>
                             <option value="Day2">روزکار دوم</option>
                             <option value="Night1">شب‌کار اول</option>
                             <option value="Night2">شب‌کار دوم</option>
                         </select>
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">روز هفته</label>
                         <div className="w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 text-center font-bold">
                             {getDayOfWeek(shiftInfo.date)}
                         </div>
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">تاریخ</label>
                         <ShamsiDatePicker 
                            value={shiftInfo.date}
                            onChange={d => setShiftInfo({...shiftInfo, date: d})}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">سرپرست شیفت</label>
                         <input type="text" value={user.fullName} disabled className="w-full p-3 rounded-xl border bg-gray-100 text-gray-500" />
                     </div>
                 </div>

                 {/* Personnel Selection */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Present List */}
                     <div>
                         <h3 className="font-bold text-lg text-green-700 mb-2 flex items-center gap-2">
                             <UserCheck className="w-5 h-5"/> لیست حاضرین
                         </h3>
                         <div className="flex gap-2 mb-3">
                             <select 
                                className="flex-1 p-2 rounded-lg border outline-none" 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        addPersonnelStatus(e.target.value, 'PRESENT');
                                        e.target.value = '';
                                    }
                                }}
                             >
                                 <option value="">افزودن فرد حاضر...</option>
                                 {getAvailablePersonnel().map(p => (
                                     <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                 ))}
                             </select>
                         </div>
                         <div className="space-y-2">
                             {getPersonnelByStatus('PRESENT').map(p => (
                                 <div key={p.id} className="flex justify-between items-center bg-green-50 border border-green-200 p-2 rounded-lg text-green-800 text-sm">
                                     <span>{p.first_name} {p.last_name} <span className="opacity-70 text-xs">({p.unit})</span></span>
                                     <button type="button" onClick={() => removePersonnelStatus(p.id)} className="text-red-500 hover:bg-white rounded-full p-1"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                             ))}
                             {getPersonnelByStatus('PRESENT').length === 0 && <p className="text-gray-400 text-sm italic">لیست خالی است</p>}
                         </div>
                     </div>

                     {/* Absent List */}
                     <div>
                         <h3 className="font-bold text-lg text-red-700 mb-2 flex items-center gap-2">
                             <UserX className="w-5 h-5"/> لیست غایبین
                         </h3>
                         <div className="flex gap-2 mb-3">
                             <select 
                                className="flex-1 p-2 rounded-lg border outline-none" 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        addPersonnelStatus(e.target.value, 'ABSENT');
                                        e.target.value = '';
                                    }
                                }}
                             >
                                 <option value="">افزودن فرد غایب...</option>
                                 {getAvailablePersonnel().map(p => (
                                     <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                 ))}
                             </select>
                         </div>
                         <div className="space-y-2">
                             {getPersonnelByStatus('ABSENT').map(p => (
                                 <div key={p.id} className="flex justify-between items-center bg-red-50 border border-red-200 p-2 rounded-lg text-red-800 text-sm">
                                     <span>{p.first_name} {p.last_name} <span className="opacity-70 text-xs">({p.unit})</span></span>
                                     <button type="button" onClick={() => removePersonnelStatus(p.id)} className="text-red-500 hover:bg-white rounded-full p-1"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                             ))}
                             {getPersonnelByStatus('ABSENT').length === 0 && <p className="text-gray-400 text-sm italic">لیست خالی است</p>}
                         </div>
                     </div>
                 </div>
             </div>
          )}

          {/* TAB 2: Production (Feed) */}
          {activeTab === 2 && (
             <div className="animate-fadeIn">
                 <div className="overflow-x-auto">
                     <table className="w-full text-center text-sm border-collapse">
                         <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600">
                             <tr>
                                 <th rowSpan={2} className="p-3 rounded-tr-xl border-b dark:border-gray-600">ساعت</th>
                                 <th colSpan={2} className="p-3 border-l border-white border-b dark:border-gray-600">خط A</th>
                                 <th colSpan={2} className="p-3 rounded-tl-xl border-b dark:border-gray-600">خط B</th>
                             </tr>
                             <tr className="text-xs">
                                 <th className="p-2 bg-gray-50 dark:bg-gray-800">تناژ</th>
                                 <th className="p-2 border-l border-white bg-gray-50 dark:bg-gray-800">نوع خوراک</th>
                                 <th className="p-2 bg-gray-50 dark:bg-gray-800">تناژ</th>
                                 <th className="p-2 bg-gray-50 dark:bg-gray-800">نوع خوراک</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {PRODUCTION_TIMES.map(time => (
                                 <tr key={time}>
                                     <td className="p-3 font-bold bg-gray-50 dark:bg-gray-900">{time}</td>
                                     <td className="p-2">
                                         <input 
                                            type="number" 
                                            placeholder="0"
                                            className="w-full text-center p-2 rounded border focus:border-primary outline-none"
                                            value={production.lineA[time] || ''}
                                            onChange={e => handleTonnageChange('lineA', time, e.target.value)}
                                         />
                                     </td>
                                     <td className="p-2 border-l border-gray-100 dark:border-gray-700">
                                         <input 
                                            type="text" 
                                            placeholder="-"
                                            className="w-full text-center p-2 rounded border focus:border-primary outline-none text-xs"
                                            value={feedTypes.lineA[time] || ''}
                                            onChange={e => handleFeedTypeChange('lineA', time, e.target.value)}
                                         />
                                     </td>
                                     <td className="p-2">
                                         <input 
                                            type="number" 
                                            placeholder="0"
                                            className="w-full text-center p-2 rounded border focus:border-primary outline-none"
                                            value={production.lineB[time] || ''}
                                            onChange={e => handleTonnageChange('lineB', time, e.target.value)}
                                         />
                                     </td>
                                     <td className="p-2">
                                         <input 
                                            type="text" 
                                            placeholder="-"
                                            className="w-full text-center p-2 rounded border focus:border-primary outline-none text-xs"
                                            value={feedTypes.lineB[time] || ''}
                                            onChange={e => handleFeedTypeChange('lineB', time, e.target.value)}
                                         />
                                     </td>
                                 </tr>
                             ))}
                             <tr className="bg-primary/5 font-bold text-lg">
                                 <td className="p-4 text-primary">مجموع</td>
                                 <td className="p-4">{calculateTotalTonnage('lineA')} تن</td>
                                 <td className="p-4 text-sm text-gray-400">-</td>
                                 <td className="p-4">{calculateTotalTonnage('lineB')} تن</td>
                                 <td className="p-4 text-sm text-gray-400">-</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
          )}

          {/* TAB 3: Ball Mills */}
          {activeTab === 3 && (
              <div className="space-y-6 animate-fadeIn">
                  {['Line A', 'Line B'].map(lineName => {
                      const lineKey = lineName === 'Line A' ? 'lineA' : 'lineB';
                      return (
                          <div key={lineKey} className="border rounded-xl p-4 relative mt-4">
                              <span className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 font-bold text-primary border rounded shadow-sm">{lineName === 'Line A' ? 'خط A' : 'خط B'}</span>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                  {['Primary', 'Secondary'].map(millType => {
                                      const typeKey = millType.toLowerCase();
                                      const millState = (ballMills as any)[lineKey][typeKey];
                                      const millName = `بالمیل ${millType === 'Primary' ? 'یک (اولیه)' : 'دو (ثانویه)'}`;
                                      
                                      return (
                                          <div key={millType} className={`p-3 rounded-lg shadow-sm border transition-all ${millState.active ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800 opacity-80'}`}>
                                              <div className="flex justify-between items-center mb-3 border-b pb-2">
                                                  <h4 className="font-bold text-sm">{millName}</h4>
                                                  <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 rounded cursor-pointer"
                                                    checked={millState.active}
                                                    onChange={e => {
                                                        const newState = { ...ballMills };
                                                        (newState as any)[lineKey][typeKey].active = e.target.checked;
                                                        setBallMills(newState);
                                                    }}
                                                  />
                                              </div>
                                              
                                              {millState.active && (
                                                  <div className="animate-slideDown">
                                                      <div className="grid grid-cols-2 gap-2 mb-4">
                                                          <div>
                                                              <label className="text-xs text-gray-500 block mb-1">جریان (08:00)</label>
                                                              <input type="number" className="w-full p-2 rounded border text-center" value={millState.amp08} onChange={e => {
                                                                  const newState = { ...ballMills };
                                                                  (newState as any)[lineKey][typeKey].amp08 = e.target.value;
                                                                  setBallMills(newState);
                                                              }} />
                                                          </div>
                                                          <div>
                                                              <label className="text-xs text-gray-500 block mb-1">جریان (02:00)</label>
                                                              <input type="number" className="w-full p-2 rounded border text-center" value={millState.amp02} onChange={e => {
                                                                  const newState = { ...ballMills };
                                                                  (newState as any)[lineKey][typeKey].amp02 = e.target.value;
                                                                  setBallMills(newState);
                                                              }} />
                                                          </div>
                                                          <div>
                                                              <label className="text-xs text-gray-500 block mb-1">دانسیته (08:00)</label>
                                                              <input type="number" className="w-full p-2 rounded border text-center" value={millState.dens08} onChange={e => {
                                                                  const newState = { ...ballMills };
                                                                  (newState as any)[lineKey][typeKey].dens08 = e.target.value;
                                                                  setBallMills(newState);
                                                              }} />
                                                          </div>
                                                          <div>
                                                              <label className="text-xs text-gray-500 block mb-1">دانسیته (02:00)</label>
                                                              <input type="number" className="w-full p-2 rounded border text-center" value={millState.dens02} onChange={e => {
                                                                  const newState = { ...ballMills };
                                                                  (newState as any)[lineKey][typeKey].dens02 = e.target.value;
                                                                  setBallMills(newState);
                                                              }} />
                                                          </div>
                                                      </div>
                                                      
                                                      {/* Ball Charge */}
                                                      <div className="border-t pt-2">
                                                          <label className="text-xs font-bold block mb-2">شارژ گلوله (سایز - تعداد بشکه)</label>
                                                          <div className="flex gap-2">
                                                              <select className="flex-1 p-1 rounded border text-xs" id={`size-${lineKey}-${typeKey}`}>
                                                                  {BALL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                              </select>
                                                              <input type="number" className="w-16 p-1 rounded border text-center text-xs" placeholder="تعداد" id={`count-${lineKey}-${typeKey}`} />
                                                              <button type="button" onClick={() => {
                                                                  const size = (document.getElementById(`size-${lineKey}-${typeKey}`) as HTMLSelectElement).value;
                                                                  const count = Number((document.getElementById(`count-${lineKey}-${typeKey}`) as HTMLInputElement).value);
                                                                  if(count > 0) {
                                                                      const newState = { ...ballMills };
                                                                      (newState as any)[lineKey][typeKey].balls.push({size, count});
                                                                      setBallMills(newState);
                                                                  }
                                                              }} className="bg-blue-500 text-white px-2 rounded">+</button>
                                                          </div>
                                                          <div className="mt-2 space-y-1">
                                                              {millState.balls.map((b: any, idx: number) => (
                                                                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-1 rounded border">
                                                                      <span>سایز {b.size} - <span className="font-bold">{b.count} بشکه</span></span>
                                                                      <button 
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newState = { ...ballMills };
                                                                            (newState as any)[lineKey][typeKey].balls = (newState as any)[lineKey][typeKey].balls.filter((_:any, i:number) => i !== idx);
                                                                            setBallMills(newState);
                                                                        }}
                                                                        className="text-red-500 hover:bg-red-100 p-1 rounded"
                                                                      >
                                                                          <Trash2 className="w-3 h-3" />
                                                                      </button>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
          
          {/* TAB 4: Hydrocyclones */}
          {activeTab === 4 && (
              <div className="space-y-6 animate-fadeIn">
                  {['Line A', 'Line B'].map(lineName => {
                      const lineKey = lineName === 'Line A' ? 'lineA' : 'lineB';
                      return (
                          <div key={lineKey} className="border rounded-xl p-4 relative mt-4">
                              <span className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 font-bold text-primary border rounded shadow-sm">{lineName === 'Line A' ? 'خط A' : 'خط B'}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                  {['Primary', 'Secondary'].map(type => {
                                      const typeKey = type.toLowerCase();
                                      const state = (hydrocyclones as any)[lineKey][typeKey];
                                      return (
                                          <div key={type} className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                              <div className="flex justify-between items-center mb-3">
                                                  <h4 className="font-bold">{type === 'Primary' ? 'هیدروسیکلون شماره یک' : 'هیدروسیکلون شماره دو'}</h4>
                                                  <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5"
                                                    checked={state.inCircuit} 
                                                    onChange={e => {
                                                        const newState = {...hydrocyclones};
                                                        (newState as any)[lineKey][typeKey].inCircuit = e.target.checked;
                                                        setHydrocyclones(newState);
                                                    }}
                                                  />
                                              </div>
                                              
                                              {state.inCircuit && (
                                                  <div className="animate-slideDown">
                                                      <div className="grid grid-cols-6 gap-2 mb-4">
                                                          {Array.from({length: 12}).map((_, i) => (
                                                              <button
                                                                type="button"
                                                                key={i}
                                                                onClick={() => {
                                                                    const newState = {...hydrocyclones};
                                                                    const list = (newState as any)[lineKey][typeKey].activeCyclones;
                                                                    if(list.includes(i+1)) {
                                                                        (newState as any)[lineKey][typeKey].activeCyclones = list.filter((n:number) => n !== i+1);
                                                                    } else {
                                                                        (newState as any)[lineKey][typeKey].activeCyclones.push(i+1);
                                                                    }
                                                                    setHydrocyclones(newState);
                                                                }}
                                                                className={`w-full aspect-square rounded text-xs font-bold transition
                                                                    ${state.activeCyclones.includes(i+1) ? 'bg-blue-600 text-white' : 'bg-white border text-gray-400'}
                                                                `}
                                                              >
                                                                  {i+1}
                                                              </button>
                                                          ))}
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-2">
                                                          <input 
                                                            placeholder="فشار (Bar)" 
                                                            className="p-2 text-center rounded border"
                                                            value={state.pressure}
                                                            onChange={e => {
                                                                const newState = {...hydrocyclones};
                                                                (newState as any)[lineKey][typeKey].pressure = e.target.value;
                                                                setHydrocyclones(newState);
                                                            }}
                                                          />
                                                          <input 
                                                            placeholder="زاویه" 
                                                            className="p-2 text-center rounded border"
                                                            value={state.angle}
                                                            onChange={e => {
                                                                const newState = {...hydrocyclones};
                                                                (newState as any)[lineKey][typeKey].angle = e.target.value;
                                                                setHydrocyclones(newState);
                                                            }}
                                                          />
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {/* TAB 9: Drum Magnets */}
          {activeTab === 9 && (
              <div className="space-y-6 animate-fadeIn">
                  {['Line A', 'Line B'].map(lineName => {
                      const lineKey = lineName === 'Line A' ? 'lineA' : 'lineB';
                      const activeDrums = (drumMagnets as any)[lineKey];
                      return (
                          <div key={lineKey} className="border rounded-xl p-4 relative mt-4">
                              <span className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 font-bold text-primary border rounded shadow-sm">{lineName === 'Line A' ? 'خط A' : 'خط B'}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  {DRUM_TYPES.map(drum => (
                                      <div key={drum.key} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${activeDrums[drum.key] ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'}`}>
                                          <span className={`font-bold ${activeDrums[drum.key] ? 'text-blue-800' : 'text-gray-500'}`}>{drum.label}</span>
                                          <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-blue-600"
                                            checked={activeDrums[drum.key]}
                                            onChange={e => {
                                                setDrumMagnets(prev => ({
                                                    ...prev,
                                                    [lineKey]: { ...prev[lineKey as 'lineA'|'lineB'], [drum.key]: e.target.checked }
                                                }));
                                            }}
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {/* TAB 5: Thickeners */}
          {activeTab === 5 && (
               <div className="space-y-6 animate-fadeIn">
                   {['Line A', 'Line B'].map(lineName => {
                       const lineKey = lineName === 'Line A' ? 'lineA' : 'lineB';
                       return (
                           <div key={lineKey} className="border rounded-xl p-4 relative mt-4">
                               <span className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 font-bold text-primary border rounded shadow-sm">{lineName === 'Line A' ? 'خط A' : 'خط B'}</span>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                   {(thickeners as any)[lineKey].map((thick: any, idx: number) => (
                                       <div key={idx} className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                           <div className="flex justify-between mb-3">
                                               <span className="font-bold">تیکنر شماره {NUM_TO_WORD[idx]}</span>
                                               <input 
                                                type="checkbox" 
                                                className="w-5 h-5"
                                                checked={thick.active} 
                                                onChange={() => {
                                                   const newState = {...thickeners};
                                                   (newState as any)[lineKey][idx].active = !thick.active;
                                                   setThickeners(newState);
                                               }} />
                                           </div>
                                           {thick.active && (
                                               <div className="space-y-3 animate-slideDown">
                                                   <input placeholder="فشار (Bar)" className="w-full p-2 text-sm border rounded" value={thick.pressure} onChange={e => {
                                                       const newState = {...thickeners};
                                                       (newState as any)[lineKey][idx].pressure = e.target.value;
                                                       setThickeners(newState);
                                                   }} />
                                                   <input placeholder="ارتفاع جک (cm)" className="w-full p-2 text-sm border rounded" value={thick.jackHeight} onChange={e => {
                                                       const newState = {...thickeners};
                                                       (newState as any)[lineKey][idx].jackHeight = e.target.value;
                                                       setThickeners(newState);
                                                   }} />
                                                   <div className="flex items-center gap-2">
                                                       <span className="text-xs w-16 text-gray-500">کارکرد:</span>
                                                       <div className="flex-1">
                                                            <ClockTimePicker 
                                                                    value={thick.output} 
                                                                    onChange={val => {
                                                                        const newState = {...thickeners};
                                                                        (newState as any)[lineKey][idx].output = val;
                                                                        setThickeners(newState);
                                                                    }} 
                                                            />
                                                       </div>
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                       <span className="text-xs w-16 text-gray-500">خروجی کانال:</span>
                                                       <div className="flex-1">
                                                            <ClockTimePicker 
                                                                    value={thick.channelOutput} 
                                                                    onChange={val => {
                                                                        const newState = {...thickeners};
                                                                        (newState as any)[lineKey][idx].channelOutput = val;
                                                                        setThickeners(newState);
                                                                    }} 
                                                            />
                                                       </div>
                                                   </div>
                                               </div>
                                           )}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )
                   })}
               </div>
          )}

          {/* TAB 6: Concentrate Filters */}
          {activeTab === 6 && (
              <div className="space-y-4 animate-fadeIn">
                  {['lineA', 'lineB', 'reserve'].map(filterKey => {
                      const state = (concentrateFilters as any)[filterKey];
                      const title = filterKey === 'reserve' ? 'فیلتر کنسانتره رزرو' : `فیلتر کنسانتره خط ${filterKey === 'lineA' ? 'A' : 'B'}`;
                      
                      return (
                          <div key={filterKey} className={`border-2 rounded-xl p-4 transition-all ${state.active ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3 mb-4">
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-primary"
                                    checked={state.active}
                                    onChange={e => {
                                        setConcentrateFilters({
                                            ...concentrateFilters,
                                            [filterKey]: { ...state, active: e.target.checked }
                                        });
                                    }}
                                  />
                                  <h3 className="font-bold text-lg">{title}</h3>
                              </div>

                              {state.active && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideDown">
                                      <div className="space-y-3">
                                          <OperatorSelect 
                                            label="اپراتور فیلتر"
                                            value={state.operator} 
                                            onChange={(val: string) => setConcentrateFilters({
                                                ...concentrateFilters,
                                                [filterKey]: { ...state, operator: val }
                                            })}
                                          />
                                          <div>
                                              <label className="block text-xs font-bold mb-1">ساعت کارکرد (مدت)</label>
                                              <ClockTimePicker 
                                                value={state.hours}
                                                onChange={val => setConcentrateFilters({
                                                    ...concentrateFilters,
                                                    [filterKey]: { ...state, hours: val }
                                                })}
                                              />
                                          </div>
                                      </div>
                                      <div className="col-span-2">
                                          <ClothGrid 
                                            title={title}
                                            selectedCloths={state.cloths}
                                            onChange={(newCloths) => setConcentrateFilters({
                                                ...concentrateFilters,
                                                [filterKey]: { ...state, cloths: newCloths }
                                            })}
                                          />
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          )}

           {/* TAB 7: Recovery Filters */}
           {activeTab === 7 && (
              <div className="space-y-6 animate-fadeIn">
                   {['Line A', 'Line B'].map(lineName => {
                       const lineKey = lineName === 'Line A' ? 'lineA' : 'lineB';
                       return (
                           <div key={lineKey}>
                               <h3 className="font-bold mb-3">{lineName === 'Line A' ? 'فیلترهای بازیافت خط A' : 'فیلترهای بازیافت خط B'}</h3>
                               <div className="grid grid-cols-1 gap-4">
                                   {(recoveryFilters as any)[lineKey].map((filter: any, idx: number) => (
                                       <div key={idx} className={`border rounded-xl p-4 ${filter.active ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200' : ''}`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5"
                                                    checked={filter.active}
                                                    onChange={e => {
                                                        const newState = {...recoveryFilters};
                                                        (newState as any)[lineKey][idx].active = e.target.checked;
                                                        setRecoveryFilters(newState);
                                                    }}
                                                />
                                                <span className="font-bold">فیلتر بازیافت شماره {NUM_TO_WORD[idx]}</span>
                                            </div>
                                            {filter.active && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <OperatorSelect 
                                                            label="اپراتور"
                                                            value={filter.operator}
                                                            onChange={(val: string) => {
                                                                const newState = {...recoveryFilters};
                                                                (newState as any)[lineKey][idx].operator = val;
                                                                setRecoveryFilters(newState);
                                                            }}
                                                        />
                                                        <div>
                                                            <label className="block text-xs font-bold mb-1">ساعت کارکرد (مدت)</label>
                                                            <ClockTimePicker 
                                                                value={filter.hours}
                                                                onChange={(val) => {
                                                                    const newState = {...recoveryFilters};
                                                                    (newState as any)[lineKey][idx].hours = val;
                                                                    setRecoveryFilters(newState);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ClothGrid 
                                                        title={`بازیافت ${lineName} شماره ${idx+1}`}
                                                        selectedCloths={filter.cloths}
                                                        onChange={(newCloths) => {
                                                            const newState = {...recoveryFilters};
                                                            (newState as any)[lineKey][idx].cloths = newCloths;
                                                            setRecoveryFilters(newState);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       );
                   })}
              </div>
           )}

           {/* TAB 8: Downtime & Pumps & Footer */}
           {activeTab === 8 && (
               <div className="space-y-8 animate-fadeIn">
                   <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                       <h3 className="font-bold mb-3">پمپ‌های فعال</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className="block text-xs text-gray-500 mb-2">پمپ های آب پروسس</label>
                               <div className="flex gap-2">
                                   {['FWP1', 'FWP2', 'FWP3'].map(p => (
                                       <button 
                                        type="button"
                                        key={p}
                                        onClick={() => {
                                            const current = pumps.process;
                                            setPumps({...pumps, process: current.includes(p) ? current.filter(x=>x!==p) : [...current, p]});
                                        }}
                                        className={`px-4 py-2 rounded border ${pumps.process.includes(p) ? 'bg-blue-600 text-white' : 'bg-white'}`}
                                       >
                                           {p}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           <div>
                               <label className="block text-xs text-gray-500 mb-2">پمپ‌های آب تمیز</label>
                               <div className="flex gap-2">
                                   {['CWP1', 'CWP2', 'CWP3'].map(p => (
                                       <button 
                                        type="button"
                                        key={p}
                                        onClick={() => {
                                            const current = pumps.cleanWater;
                                            setPumps({...pumps, cleanWater: current.includes(p) ? current.filter(x=>x!==p) : [...current, p]});
                                        }}
                                        className={`px-4 py-2 rounded border ${pumps.cleanWater.includes(p) ? 'bg-blue-600 text-white' : 'bg-white'}`}
                                       >
                                           {p}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {['lineA', 'lineB'].map(lineKey => {
                           const state = (downtime as any)[lineKey];
                           return (
                               <div key={lineKey} className="border-2 border-red-100 rounded-xl p-4">
                                   <h3 className="font-bold text-center mb-3 text-red-800">{lineKey === 'lineA' ? 'مدت کارکرد و توقفات خط A' : 'مدت کارکرد و توقفات خط B'}</h3>
                                   <div className="flex gap-2 mb-3">
                                       <div className="flex-1">
                                            <label className="text-xs block mb-1">مدت کارکرد</label>
                                            <ClockTimePicker value={state.workTime} onChange={v => setDowntime({...downtime, [lineKey]: {...state, workTime: v}})} />
                                       </div>
                                       <div className="flex-1">
                                            <label className="text-xs block mb-1">مدت توقف</label>
                                            <ClockTimePicker value={state.stopTime} onChange={v => setDowntime({...downtime, [lineKey]: {...state, stopTime: v}})} />
                                       </div>
                                   </div>
                                   {state.stopTime && state.stopTime !== '00:00' && (
                                       <div className="animate-slideDown">
                                           <label className="text-xs font-bold text-red-600 block mb-1">علت توقف (اجباری) <span className="text-red-500">*</span></label>
                                           <textarea 
                                             className="w-full p-2 border border-red-300 rounded-lg bg-red-50"
                                             value={state.reason}
                                             onChange={e => setDowntime({...downtime, [lineKey]: {...state, reason: e.target.value}})}
                                           ></textarea>
                                       </div>
                                   )}
                               </div>
                           )
                       })}
                   </div>

                   <div>
                       <label className="block font-bold mb-2">اقدامات لازم برای شیفت بعدی</label>
                       <div className="relative">
                           <textarea 
                             className="w-full p-4 pl-12 border rounded-xl h-32" 
                             placeholder="توضیحات فنی برای همکاران شیفت بعد..."
                             value={footer.nextShiftActions}
                             onChange={e => setFooter({...footer, nextShiftActions: e.target.value})}
                           ></textarea>
                           <button 
                             type="button" 
                             onClick={handleNextShiftActionsVoice}
                             className={`absolute left-3 bottom-3 p-2 rounded-full transition ${listeningField === 'nextShift' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}
                           >
                               <Mic className="w-5 h-5" />
                           </button>
                       </div>
                   </div>

                   <div className="flex justify-end pt-4 border-t">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-primary text-white px-8 py-4 rounded-xl shadow-xl hover:bg-red-800 flex items-center gap-2 font-bold text-lg disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin"/> : <Save className="w-6 h-6" />}
                            ثبت نهایی گزارش شیفت
                        </button>
                   </div>
               </div>
           )}
      </form>
    </div>
  );
};
