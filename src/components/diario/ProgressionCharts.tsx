import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { WorkoutSession } from '../../lib/workoutStore';
import { format, parseISO, subDays, subMonths, isAfter } from 'date-fns';
import { CustomSelect } from '../CustomSelect';

interface ProgressionChartsProps {
  workouts: WorkoutSession[];
}

type PeriodFilter = '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

export default function ProgressionCharts({ workouts }: ProgressionChartsProps) {
  const [period, setPeriod] = useState<PeriodFilter>('1m');
  const [filterName, setFilterName] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const uniqueNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => {
      if (w.name) names.add(w.name.trim());
    });
    return Array.from(names).sort();
  }, [workouts]);

  const filteredByName = useMemo(() => {
    if (filterName === 'all') return workouts;
    return workouts.filter(w => w.name && w.name.trim() === filterName);
  }, [workouts, filterName]);

  // 1. Extract all unique exercise names based on filtered workouts by name
  const allExercises = useMemo(() => {
    const names = new Set<string>();
    filteredByName.forEach(w => w.exercises.forEach(ex => names.add(ex.name.toLowerCase().trim())));
    return Array.from(names).sort();
  }, [filteredByName]);

  // Set initial selected exercise if none selected and we have some
  if (selectedExercises.length === 0 && allExercises.length > 0) {
    setSelectedExercises([allExercises[0]]);
  }

  // 2. Filter workouts by date
  const filteredWorkouts = useMemo(() => {
    if (period === 'all') return filteredByName;
    
    const now = new Date();
    let cutoff: Date;
    
    switch (period) {
      case '1w': cutoff = subDays(now, 7); break;
      case '1m': cutoff = subMonths(now, 1); break;
      case '3m': cutoff = subMonths(now, 3); break;
      case '6m': cutoff = subMonths(now, 6); break;
      case '1y': cutoff = subMonths(now, 12); break;
      default: cutoff = subMonths(now, 1);
    }
    
    return filteredByName.filter(w => isAfter(parseISO(w.date), cutoff));
  }, [filteredByName, period]);

  // 3. Prepare data for Recharts
  const chartData = useMemo(() => {
    // Sort workouts ascending for chart (oldest to newest)
    const sorted = [...filteredWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sorted.map(workout => {
      const point: any = { date: format(parseISO(workout.date), 'dd/MM') };
      
      // Find max weight for each selected exercise in this workout
      selectedExercises.forEach(exName => {
        // Find all matches for this exercise in the current workout
        const matches = workout.exercises.filter(ex => ex.name.toLowerCase().trim() === exName);
        if (matches.length > 0) {
          let maxWeight = 0;
          matches.forEach(match => {
            match.sets.forEach(set => {
              if (set.weight > maxWeight) maxWeight = set.weight;
            });
          });
          point[exName] = maxWeight > 0 ? maxWeight : null;
        }
      });
      
      return point;
    });
  }, [filteredWorkouts, selectedExercises]);

  const colors = ['#a3e635', '#60a5fa', '#f472b6', '#fbbf24', '#c084fc'];

  if (workouts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Nessun dato disponibile. Inizia a registrare i tuoi allenamenti!</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Progressione Carichi</h2>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {uniqueNames.length > 0 && (
          <div className="card" style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', minWidth: '200px' }}>
            <CustomSelect
              value={filterName}
              onChange={(val) => {
                setFilterName(val);
                setSelectedExercises([]);
              }}
              options={[
                { value: 'all', label: 'Tutte le Schede' },
                ...uniqueNames.map(name => ({ value: name, label: name }))
              ]}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {(['1w', '1m', '3m', '6m', '1y', 'all'] as PeriodFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="card"
              style={{ 
                padding: '0.75rem 1rem', 
                fontSize: '0.875rem', 
                flexShrink: 0, 
                cursor: 'pointer',
                background: period === p ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                color: period === p ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              {p === '1w' ? '1 Sett' : p === '1m' ? '1 Mese' : p === '3m' ? '3 Mesi' : p === '6m' ? '6 Mesi' : p === '1y' ? '1 Anno' : 'Tutto'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '300px', width: '100%', marginBottom: '1.5rem', marginLeft: '-1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '0.5rem', color: '#f5f5f5' }}
              itemStyle={{ color: '#a3e635' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            {selectedExercises.map((exName, i) => (
              <Line 
                key={exName}
                type="monotone" 
                dataKey={exName} 
                name={exName.charAt(0).toUpperCase() + exName.slice(1)}
                stroke={colors[i % colors.length]} 
                strokeWidth={3}
                dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Selector */}
        <div className="card" style={{ display: 'flex', marginBottom: '0.75rem', padding: '0.25rem 1rem', alignItems: 'center' }}>
          <CustomSelect
            multiple={true}
            value={selectedExercises}
            onChange={(val) => {
              setSelectedExercises(val);
            }}
            placeholder="Seleziona esercizi..."
            options={allExercises.map(exName => ({
              value: exName,
              label: exName.charAt(0).toUpperCase() + exName.slice(1)
            }))}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
    </div>
  );
}
