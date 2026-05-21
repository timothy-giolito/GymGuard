import { useState, useEffect } from 'react';
import { PlusCircle, LineChart, History } from 'lucide-react';
import { workoutStore } from '../lib/workoutStore';
import type { WorkoutSession } from '../lib/workoutStore';
import WorkoutForm from '../components/diario/WorkoutForm';
import ProgressionCharts from '../components/diario/ProgressionCharts';
import WorkoutStats from '../components/diario/WorkoutStats';
import WorkoutHistory from '../components/diario/WorkoutHistory';

type Tab = 'overview' | 'add' | 'history';

export default function Diario() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    setLoading(true);
    const data = await workoutStore.getWorkouts();
    setWorkouts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleSave = () => {
    loadWorkouts();
    setActiveTab('overview');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '1rem' }}>
      <h2 className="app-title" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Diario Allenamenti</h2>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '0.75rem' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', background: activeTab === 'overview' ? 'var(--bg-surface-active)' : 'transparent', color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}
        >
          <LineChart size={18} /> Progressione
        </button>
        <button 
          onClick={() => setActiveTab('add')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', background: activeTab === 'add' ? 'var(--bg-surface-active)' : 'transparent', color: activeTab === 'add' ? 'var(--color-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}
        >
          <PlusCircle size={18} /> Registra
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', background: activeTab === 'history' ? 'var(--bg-surface-active)' : 'transparent', color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}
        >
          <History size={18} /> Storico
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div className="fade-in">
            <WorkoutStats workouts={workouts} />
            <ProgressionCharts workouts={workouts} />
            
            {workouts.length === 0 && (
              <button className="btn btn-primary" onClick={() => setActiveTab('add')} style={{ width: '100%', marginTop: '1rem' }}>
                <PlusCircle size={18} /> Inizia il tuo primo allenamento
              </button>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="fade-in">
            <WorkoutForm onSave={handleSave} onCancel={() => setActiveTab('overview')} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="fade-in">
            <WorkoutHistory workouts={workouts} onUpdate={loadWorkouts} />
          </div>
        )}
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
