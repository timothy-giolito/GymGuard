import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Timer as TimerIcon, FileText, Dumbbell, User } from 'lucide-react';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Subscriptions from './pages/Subscriptions';
import Timer from './pages/Timer';
import Workouts from './pages/Workouts';
import Diario from './pages/Diario';
import Profile from './pages/Profile';
import { TimerProvider } from './lib/TimerContext';
import { AuthProvider } from './lib/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const navigate = useNavigate();

  return (
    <>
      <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">GymGuard</h1>
        <button 
          onClick={() => navigate('/profile')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Profilo"
        >
          <User size={20} />
        </button>
      </div>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/subscriptions" replace />} />
          <Route path="/subscriptions" element={<PrivateRoute><Subscriptions /></PrivateRoute>} />
          <Route path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
          <Route path="/workouts" element={<PrivateRoute><Workouts /></PrivateRoute>} />
          <Route path="/diario" element={<PrivateRoute><Diario /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        <NavLink
          to="/subscriptions"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={24} />
          <span>Abbonamenti</span>
        </NavLink>
        <NavLink
          to="/timer"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <TimerIcon size={24} />
          <span>Timer</span>
        </NavLink>
        <NavLink
          to="/workouts"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={24} />
          <span>Schede</span>
        </NavLink>
        <NavLink
          to="/diario"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Dumbbell size={24} />
          <span>Diario</span>
        </NavLink>
      </nav>
    </>
  );
}

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0a0a0a' }).catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <TimerProvider>
        <Router>
          <AppContent />
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
