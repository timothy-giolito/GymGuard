import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Timer as TimerIcon, FileText, Dumbbell, LogOut, User } from 'lucide-react';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Subscriptions from './pages/Subscriptions';
import Timer from './pages/Timer';
import Workouts from './pages/Workouts';
import Diario from './pages/Diario';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { TimerProvider } from './lib/TimerContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const isAuthPage = location.pathname === '/login';

  return (
    <>
      {!isAuthPage && (
        <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="app-title">GymGuard</h1>
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => navigate('/profile')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Profilo"
              >
                <User size={20} />
              </button>
              <button 
                onClick={() => logout()} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <main className="main-content" style={isAuthPage ? { padding: 0, paddingBottom: 0 } : undefined}>
        <Routes>
          <Route path="/" element={<Navigate to="/subscriptions" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subscriptions" element={<PrivateRoute><Subscriptions /></PrivateRoute>} />
          <Route path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
          <Route path="/workouts" element={<PrivateRoute><Workouts /></PrivateRoute>} />
          <Route path="/diario" element={<PrivateRoute><Diario /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </main>

      {!isAuthPage && (
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
      )}
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
