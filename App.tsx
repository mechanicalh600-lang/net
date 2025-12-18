import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { WorkOrders } from './pages/WorkOrders';
import { Inspections } from './pages/Inspections';
import { PartRequests } from './pages/PartRequests';
import { Documents } from './pages/Documents';
import { Meetings } from './pages/Meetings';
import { Suggestions } from './pages/Suggestions';
import { PurchaseRequests } from './pages/PurchaseRequests';
import { Settings } from './pages/Settings';
import { SnowEffect } from './components/SnowEffect';
import { User, UserRole } from './types';
import { mockIp, getShamsiDate, getTime } from './utils';

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [snowMode, setSnowMode] = useState<boolean>(() => {
    return localStorage.getItem('snowMode') === 'true';
  });

  // Effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('snowMode', String(snowMode));
  }, [snowMode]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    console.log(`LOG: LOGIN user=${newUser.username} ip=${mockIp} date=${getShamsiDate()} time=${getTime()}`);
  };

  const handleLogout = () => {
    if (user) {
        console.log(`LOG: LOGOUT user=${user.username} ip=${mockIp} date=${getShamsiDate()} time=${getTime()}`);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <HashRouter>
      <SnowEffect enabled={snowMode} />
      <Layout 
        user={user} 
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      >
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          
          <Route path="/work-orders" element={user ? <WorkOrders /> : <Navigate to="/login" />} />
          <Route path="/part-requests" element={user ? <PartRequests user={user} /> : <Navigate to="/login" />} />
          <Route path="/inspections" element={user ? <Inspections user={user} /> : <Navigate to="/login" />} />
          
          <Route path="/documents" element={user ? <Documents /> : <Navigate to="/login" />} />
          <Route path="/meetings" element={user ? <Meetings /> : <Navigate to="/login" />} />
          <Route path="/suggestions" element={user ? <Suggestions user={user} /> : <Navigate to="/login" />} />
          <Route path="/purchases" element={user ? <PurchaseRequests user={user} /> : <Navigate to="/login" />} />

          <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminPanel /> : <Navigate to="/" />} />
          
          <Route path="/settings" element={user ? <Settings user={user} snowMode={snowMode} setSnowMode={setSnowMode} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;