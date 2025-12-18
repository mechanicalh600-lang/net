import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { MENU_ITEMS } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const isHome = location.pathname === '/';

  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        md:relative md:translate-x-0 md:w-64 md:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary dark:text-red-400">CMMS صبانور</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
               {user?.avatar ? <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover"/> : <UserIcon />}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{user?.role}</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {MENU_ITEMS.map((item) => {
              if (item.role && user?.role !== item.role && user?.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-right transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary dark:text-red-400 border-r-4 border-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
             <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{darkMode ? 'تم روشن' : 'تم تیره'}</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 px-4 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
            {!isHome && (
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-lg font-semibold">{MENU_ITEMS.find(m => m.path === location.pathname)?.title || 'CMMS'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Context Actions could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};