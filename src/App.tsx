import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Timer as TimerIcon, FileText, Dumbbell } from 'lucide-react';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Subscriptions from './pages/Subscriptions';
import Timer from './pages/Timer';
import Workouts from './pages/Workouts';
import Diario from './pages/Diario';
import { TimerProvider } from './lib/TimerContext';

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Force light text (Style.Dark) and dark background regardless of system theme
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0a0a0a' }).catch(() => {});
    }
  }, []);

  return (
    <TimerProvider>
      <Router>
        <div className="app-header">
          <h1 className="app-title">GymGuard</h1>
        </div>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/subscriptions" replace />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/diario" element={<Diario />} />
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
      </Router>
    </TimerProvider>
  );
}

export default App;
