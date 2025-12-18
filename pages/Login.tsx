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
        // Handle change password logic
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
      // Logic to check new password != default
      if (password === 'admin') {
          setError('رمز عبور جدید نمی‌تواند با رمز پیش‌فرض یکسان باشد');
          return;
      }
      onLogin({ ...adminUser, isDefaultPassword: false });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
             {/* Logo Placeholder */}
             <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-primary font-bold text-2xl">S</span>
             </div>
             <h2 className="text-white text-xl font-bold">سامانه نگهداری و تعمیرات صبانور</h2>
        </div>

        <div className="p-8">
            {isResetMode ? (
                 <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h3 className="text-center font-semibold text-gray-700 dark:text-gray-200">تغییر رمز عبور اجباری</h3>
                    <div className="relative">
                        <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="رمز عبور جدید"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-red-800 text-white py-3 rounded-lg font-medium transition-colors">
                        تغییر رمز و ورود
                    </button>
                 </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                    <UserIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="نام کاربری"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    </div>

                    <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="رمز عبور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                    </div>

                    {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                    </div>
                    )}

                    <button
                    type="submit"
                    className="w-full bg-primary hover:bg-red-800 text-white py-3 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
                    >
                    ورود به سیستم
                    </button>
                </form>
            )}
        </div>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-gray-500 text-sm">نسخه {APP_VERSION}</p>
        <p className="text-gray-400 text-xs mt-1 font-mono tracking-widest">DESIGN BY H.PARSA</p>
      </footer>
    </div>
  );
};