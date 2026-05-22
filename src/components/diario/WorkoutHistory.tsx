import { workoutStore } from '../../lib/workoutStore';
import type { WorkoutSession } from '../../lib/workoutStore';
import { format, parseISO } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface WorkoutHistoryProps {
  workouts: WorkoutSession[];
  onUpdate: () => void;
  onEdit: (workout: WorkoutSession) => void;
}

export default function WorkoutHistory({ workouts, onUpdate, onEdit }: WorkoutHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await workoutStore.deleteWorkout(itemToDelete);
      setItemToDelete(null);
      onUpdate();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (workouts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Nessun allenamento registrato.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {workouts.map(workout => (
        <div key={workout.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          {/* Header (Clickable) */}
          <div 
            style={{ 
              padding: '1rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: expandedId === workout.id ? 'var(--bg-surface-hover)' : 'transparent',
              transition: 'background 0.2s ease'
            }}
            onClick={() => toggleExpand(workout.id)}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                {format(parseISO(workout.date), 'dd/MM/yyyy')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {workout.exercises.length} {workout.exercises.length === 1 ? 'esercizio' : 'esercizi'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button 
                className="btn" 
                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-primary)' }}
                onClick={(e) => { e.stopPropagation(); onEdit(workout); }}
                aria-label="Modifica"
              >
                <Edit2 size={18} />
              </button>
              <button 
                className="btn" 
                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}
                onClick={(e) => handleDeleteRequest(workout.id, e)}
              >
                <Trash2 size={18} />
              </button>
              {expandedId === workout.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
            </div>
          </div>

          {/* Details (Expandable) */}
          {expandedId === workout.id && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
              {workout.notes && (
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  "{workout.notes}"
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {workout.exercises.map(ex => (
                  <div key={ex.id}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>
                      {ex.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {ex.sets.map((set, i) => (
                        <span key={set.id} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                          {i + 1}: {set.weight}kg x {set.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      ))}

      {itemToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card animate-in fade-in zoom-in duration-200" style={{ width: '100%', maxWidth: '350px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Conferma Cancellazione</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Sei sicuro di voler eliminare questo allenamento? Questa azione non può essere annullata.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setItemToDelete(null)}>
                Annulla
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Elimina Allenamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
