
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_VERSION } from '../constants';
import { Lock, User as UserIcon, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';

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
    passwordHash: 'admin',
    isDefaultPassword: true
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.toLowerCase() === 'admin' && password === 'admin') {
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

  // Mock Build Hash
  const BUILD_HASH = "b7a9f2c";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden font-sans">
      
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-[#800020]/5 blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-sm z-10 flex flex-col gap-8">
        
        {/* Branding Section */}
        <div className="text-center flex flex-col items-center animate-fadeIn">
             {/* Logo Container - Seamless Background */}
             <div className="w-32 h-32 flex items-center justify-center mb-4 transform hover:scale-105 transition duration-500">
                {/* Logo Component imported from components/Logo.tsx */}
                <Logo className="w-full h-full drop-shadow-2xl" />
             </div>
             
             <h1 className="text-lg font-black text-[#800020] dark:text-red-400 leading-tight mb-2 px-4">
                شرکت توسعه معدنی و صنعتی صبانور
             </h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                سامانه هوشمند نگهداری و تعمیرات
             </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 animate-slideUp border border-white/50 dark:border-gray-700/50">
            {isResetMode ? (
                 <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-xl text-sm mb-4 border border-yellow-100 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>جهت امنیت بیشتر، لطفاً برای اولین ورود رمز عبور خود را تغییر دهید.</span>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 mr-1">رمز عبور جدید</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="●●●●●"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pr-12 pl-4 h-14 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all text-lg"
                                style={{ fontFamily: showPassword ? 'inherit' : 'Verdana, sans-serif' }}
                                required
                                autoFocus
                            />
                             <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-0 top-0 bottom-0 px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white h-14 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                        تغییر رمز و ورود
                    </button>
                 </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 mr-1">نام کاربری</label>
                            <div className="relative group">
                                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#800020] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="نام کاربری خود را وارد کنید"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-12 pl-4 h-14 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-100"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 mr-1">رمز عبور</label>
                            <div className="relative group">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#800020] transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="●●●●●"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-12 pl-12 h-14 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-100 tracking-wider"
                                    style={{ fontFamily: showPassword ? 'inherit' : 'Verdana, sans-serif' }}
                                    required
                                    autoComplete="current-password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-0 top-0 bottom-0 px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center justify-center gap-2 animate-shake">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#800020] hover:bg-[#600018] text-white h-14 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-xl shadow-red-900/20 flex items-center justify-center gap-2 mt-2"
                    >
                        <span>ورود به حساب</span>
                        <LogIn className="w-5 h-5" />
                    </button>
                </form>
            )}
        </div>

        <div className="text-center space-y-1 pb-4">
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                نسخه {APP_VERSION}
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-[9px] font-bold tracking-[0.1em] uppercase font-mono opacity-50">
                Hash: {BUILD_HASH}
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-[9px] font-bold tracking-[0.3em] uppercase font-sans opacity-70 mt-2">
                DESIGN BY H.PARSA
            </p>
        </div>
      </div>
    </div>
  );
};
