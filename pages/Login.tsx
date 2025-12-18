import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_VERSION } from '../constants';
import { Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  // Hardcoded Admin for demo
  const adminUser: User = {
    id: '1',
    username: 'admin',
    fullName: 'مدیر سیستم',
    role: UserRole.ADMIN,
    passwordHash: 'admin', // In real app, this is hashed
    isDefaultPassword: true
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      if (isResetMode) {
         const updatedUser = { ...adminUser, isDefaultPassword: false };
         onLogin(updatedUser);
         return;
      }
      
      if (adminUser.isDefaultPassword) {
        setIsResetMode(true);
        setError('لطفا جهت امنیت، رمز عبور پیش‌فرض خود را تغییر دهید.');
        return;
      }
      onLogin(adminUser);
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === 'admin') {
          setError('رمز عبور جدید نمی‌تواند با رمز پیش‌فرض یکسان باشد');
          return;
      }
      onLogin({ ...adminUser, isDefaultPassword: false });
  }

  // Sabanur Brand Color
  const BRAND_COLOR = "#800020";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#800020]/10 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Branding Section */}
        <div className="pt-10 pb-4 px-6 text-center flex flex-col items-center">
             {/* Sabanur SVG Logo */}
             <div className="mb-6 drop-shadow-xl filter">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5L93.3013 30V80L50 105L6.69873 80V30L50 5Z" fill={BRAND_COLOR} fillOpacity="0.1" stroke={BRAND_COLOR} strokeWidth="2"/>
                    <path d="M50 20L75 40V70L50 85L25 70V40L50 20Z" fill="white" stroke={BRAND_COLOR} strokeWidth="3"/>
                    <path d="M50 35L35 60H65L50 35Z" fill={BRAND_COLOR}/>
                    <path d="M32 68H68V72H32V68Z" fill={BRAND_COLOR}/>
                </svg>
             </div>
             
             <h1 className="text-xl md:text-2xl font-black mb-2 leading-tight" style={{ color: BRAND_COLOR }}>
                شرکت توسعه معدنی و صنعتی صبانور
             </h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium text-lg tracking-widest border-b-2 border-primary/20 pb-1">
                سامانه هوشمند نت
             </p>
        </div>

        <div className="p-8 pt-4">
            {isResetMode ? (
                 <form onSubmit={handlePasswordChange} className="space-y-6 animate-fadeIn">
                    <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-xs mb-4">
                        به دلیل اولین ورود، لطفا رمز عبور خود را تغییر دهید.
                    </div>
                    <div className="relative">
                        <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="رمز عبور جدید"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#800020] outline-none transition-all"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-red-900/20">
                        تغییر رمز و ورود
                    </button>
                 </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                    <div className="space-y-4">
                        <div className="relative group">
                            <UserIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#800020] transition-colors" />
                            <input
                                type="text"
                                placeholder="نام کاربری"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#800020] outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#800020] transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="رمز عبور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pr-10 pl-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#800020] outline-none transition-all"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-xl shadow-red-900/20 flex items-center justify-center gap-2"
                    >
                        ورود به سیستم
                    </button>
                </form>
            )}
        </div>
      </div>

      <footer className="mt-8 text-center opacity-70">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-mono mb-1">VERSION {APP_VERSION}</p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold tracking-widest uppercase">DESIGN BY H.PARSA</p>
      </footer>
    </div>
  );
};