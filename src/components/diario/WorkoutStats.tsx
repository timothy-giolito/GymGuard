import { useMemo } from 'react';
import { Trophy, TrendingUp, Calendar, Activity } from 'lucide-react';
import type { WorkoutSession } from '../../lib/workoutStore';
import { parseISO, isAfter, subDays, differenceInCalendarDays } from 'date-fns';

interface WorkoutStatsProps {
  workouts: WorkoutSession[];
}

export default function WorkoutStats({ workouts }: WorkoutStatsProps) {
  const stats = useMemo(() => {
    if (workouts.length === 0) return null;

    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);

    let weeklyVolume = 0;
    let prevWeeklyVolume = 0;
    let workoutsThisWeek = 0;
    
    // Calculate PRs (max weight ever for an exercise)
    const exerciseMaxes = new Map<string, { weight: number, date: string }>();

    workouts.forEach(w => {
      const wDate = parseISO(w.date);
      const isThisWeek = isAfter(wDate, oneWeekAgo);
      const isPrevWeek = isAfter(wDate, twoWeeksAgo) && !isThisWeek;

      if (isThisWeek) workoutsThisWeek++;

      let sessionVolume = 0;
      w.exercises.forEach(ex => {
        const exName = ex.name.toLowerCase().trim();
        
        ex.sets.forEach(set => {
          sessionVolume += (set.weight || 0) * (set.reps || 0);
          
          // Check PR
          const currentMax = exerciseMaxes.get(exName);
          if (!currentMax || set.weight > currentMax.weight) {
            exerciseMaxes.set(exName, { weight: set.weight, date: w.date });
          }
        });
      });

      if (isThisWeek) weeklyVolume += sessionVolume;
      if (isPrevWeek) prevWeeklyVolume += sessionVolume;
    });

    // Recent PRs (achieved in the last 14 days)
    const recentPRs = Array.from(exerciseMaxes.entries())
      .map(([name, data]) => ({ name, ...data }))
      .filter(pr => isAfter(parseISO(pr.date), twoWeeksAgo))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3); // top 3 recent PRs

    const volumeTrend = prevWeeklyVolume === 0 ? 100 : ((weeklyVolume - prevWeeklyVolume) / prevWeeklyVolume) * 100;

    return {
      weeklyVolume,
      volumeTrend,
      workoutsThisWeek,
      recentPRs,
      daysSinceLastWorkout: differenceInCalendarDays(now, parseISO(workouts[0].date)) // Assumes workouts are sorted desc
    };
  }, [workouts]);

  if (!stats) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
      
      {/* Volume Card */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <Activity size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Volume (7g)</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {stats.weeklyVolume} kg
        </div>
        <div style={{ fontSize: '0.75rem', color: stats.volumeTrend >= 0 ? 'var(--color-primary)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TrendingUp size={12} style={{ transform: stats.volumeTrend < 0 ? 'scaleY(-1)' : 'none' }} />
          {Math.abs(stats.volumeTrend).toFixed(0)}% vs sett. prec.
        </div>
      </div>

      {/* Frequency Card */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <Calendar size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Frequenza</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {stats.workoutsThisWeek} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/sett</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {stats.daysSinceLastWorkout === 0 ? 'Ultimo oggi' : 
           stats.daysSinceLastWorkout === 1 ? 'Ultimo ieri' : 
           `Ultimo ${stats.daysSinceLastWorkout}g fa`}
        </div>
      </div>

      {/* PRs Card */}
      {stats.recentPRs.length > 0 && (
        <div className="card" style={{ padding: '1rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            <Trophy size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nuovi Record (PR) Recenti</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.recentPRs.map(pr => (
              <div key={pr.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{pr.name}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>{pr.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
