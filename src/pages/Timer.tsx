import { Play, Pause, Square, Hourglass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTimer } from '../lib/TimerContext';

const PRESETS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '1m 30s', value: 90 },
];

export default function Timer() {
  const { 
    timeLeft, initialTime, isActive, progress,
    toggleTimer, resetTimer, startPreset,
    customMinutes, setCustomMinutes,
    customSeconds, setCustomSeconds,
    startCustom, formatTime
  } = useTimer();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <h2 className="app-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', width: '100%' }}>Timer Recupero</h2>

      {/* Visual Timer */}
      <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '2rem' }}>
        {/* SVG Circular Progress */}
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" 
            stroke="var(--bg-surface-active)" 
            strokeWidth="10" 
          />
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="10" 
            strokeDasharray="565.48" /* 2 * pi * 90 */
            strokeDashoffset={565.48 - (565.48 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Hourglass Icon inside circle */}
        <div style={{ 
          position: 'absolute', 
          top: '0', left: '0', right: '0', bottom: '0', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <motion.div 
            animate={{ rotate: isActive ? [0, 180] : 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
            style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }}
          >
            <Hourglass size={40} />
          </motion.div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            fontVariantNumeric: 'tabular-nums',
            marginTop: '0.5rem',
            color: timeLeft === 0 && initialTime > 0 ? 'var(--danger)' : 'var(--text-main)'
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`} 
          onClick={toggleTimer}
          disabled={timeLeft === 0}
          style={{ width: '120px' }}
        >
          {isActive ? <><Pause size={20} /> Pausa</> : <><Play size={20} /> Avvia</>}
        </button>
        <button 
          className="btn" 
          onClick={resetTimer}
          disabled={timeLeft === initialTime || initialTime === 0}
        >
          <Square size={20} /> Reset
        </button>
      </div>

      {/* Presets */}
      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <h3 className="label">Preset Rapidi</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {PRESETS.map((p) => (
            <button 
              key={p.value} 
              className="btn" 
              onClick={() => startPreset(p.value)}
              style={{ padding: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Timer Form */}
      <div className="card" style={{ width: '100%' }}>
        <h3 className="label" style={{ marginBottom: '1rem' }}>Personalizzato</h3>
        <form onSubmit={startCustom} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="number" 
              min="0" 
              max="60" 
              placeholder="Min" 
              className="input-field"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
            />
          </div>
          <div style={{ paddingBottom: '0.5rem', fontWeight: 'bold' }}>:</div>
          <div style={{ flex: 1 }}>
            <input 
              type="number" 
              min="0" 
              max="59" 
              placeholder="Sec" 
              className="input-field"
              value={customSeconds}
              onChange={(e) => setCustomSeconds(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!customMinutes && !customSeconds}>
            <Play size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
