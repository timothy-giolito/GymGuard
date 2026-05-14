import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Timer as TimerIcon, FileText } from 'lucide-react';
import Subscriptions from './pages/Subscriptions';
import Timer from './pages/Timer';
import Workouts from './pages/Workouts';
import { TimerProvider } from './lib/TimerContext';

function App() {
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
        </nav>
      </Router>
    </TimerProvider>
  );
}

export default App;
