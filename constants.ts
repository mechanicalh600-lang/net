import { ChartBar, FileText, Wrench, Package, ClipboardCheck, Archive, Users, Settings, LogOut, ShoppingCart, Lightbulb, FileSignature } from 'lucide-react';

export const APP_VERSION = "1.0.0";

export const MENU_ITEMS = [
  { id: 'dashboard', title: 'داشبورد', icon: ChartBar, path: '/' },
  { id: 'workorders', title: 'ثبت گزارشات', icon: Wrench, path: '/work-orders' },
  { id: 'partrequest', title: 'درخواست قطعه', icon: Package, path: '/part-requests' },
  { id: 'inspections', title: 'چک لیست بازرسی', icon: ClipboardCheck, path: '/inspections' },
  { id: 'documents', title: 'اسناد فنی', icon: Archive, path: '/documents' },
  { id: 'meetings', title: 'صورتجلسات', icon: FileSignature, path: '/meetings' },
  { id: 'suggestions', title: 'پیشنهادات فنی', icon: Lightbulb, path: '/suggestions' },
  { id: 'purchases', title: 'درخواست خرید', icon: ShoppingCart, path: '/purchases' },
  { id: 'admin', title: 'مدیریت اطلاعات پایه', icon: Users, path: '/admin', role: 'ADMIN' },
  { id: 'settings', title: 'تنظیمات', icon: Settings, path: '/settings' },
];

export const MOCK_CHART_DATA = [
  { name: 'پمپ‌ها', value: 400 },
  { name: 'نوارنقاله‌ها', value: 300 },
  { name: 'سنگ‌شکن‌ها', value: 300 },
  { name: 'الکتروموتورها', value: 200 },
];

export const MOCK_LINE_DATA = [
  { name: 'فروردین', uv: 400, pv: 2400 },
  { name: 'اردیبهشت', uv: 300, pv: 1398 },
  { name: 'خرداد', uv: 200, pv: 9800 },
  { name: 'تیر', uv: 278, pv: 3908 },
  { name: 'مرداد', uv: 189, pv: 4800 },
  { name: 'شهریور', uv: 239, pv: 3800 },
];