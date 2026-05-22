import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Copy } from 'lucide-react';
import { workoutStore } from '../../lib/workoutStore';
import type { WorkoutSession, WorkoutExercise } from '../../lib/workoutStore';
import { CustomDatePicker } from '../CustomDatePicker';

interface WorkoutFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function WorkoutForm({ onSave, onCancel }: WorkoutFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [notes, setNotes] = useState('');
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  useEffect(() => {
    workoutStore.getLastWorkout().then(setLastWorkout);
  }, []);

  const handleDuplicateLast = () => {
    if (lastWorkout) {
      // Create new IDs for duplicated exercises and sets
      const duplicatedExercises = lastWorkout.exercises.map(ex => ({
        ...ex,
        id: workoutStore.createId(),
        sets: ex.sets.map(s => ({
          ...s,
          id: workoutStore.createId(),
          completed: false
        }))
      }));
      setExercises(duplicatedExercises);
    }
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: workoutStore.createId(),
        name: '',
        sets: [{ id: workoutStore.createId(), reps: 0, weight: 0 }]
      }
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0 };
        return {
          ...ex,
          sets: [...ex.sets, { id: workoutStore.createId(), reps: lastSet.reps, weight: lastSet.weight }]
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name } : ex));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const handleSave = async () => {
    // Basic validation
    const validExercises = exercises.filter(ex => ex.name.trim() !== '' && ex.sets.length > 0);
    if (validExercises.length === 0) {
      setShowEmptyAlert(true);
      return;
    }

    const session: WorkoutSession = {
      id: workoutStore.createId(),
      date,
      exercises: validExercises,
      notes
    };

    await workoutStore.saveWorkout(session);
    onSave();
  };

  return (
    <div className="workout-form">
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Nuovo Allenamento</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Data</label>
          <CustomDatePicker 
            value={date} 
            onChange={setDate}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Note (Opzionale)</label>
          <textarea 
            className="input-field" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sensazioni, fatica, etc..."
            rows={2}
          />
        </div>

        {exercises.length === 0 && lastWorkout && (
          <button className="btn" onClick={handleDuplicateLast} style={{ width: '100%', marginBottom: '1rem', borderStyle: 'dashed' }}>
            <Copy size={18} />
            Duplica Ultimo Allenamento
          </button>
        )}

        <div className="exercises-list">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="card" style={{ marginBottom: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Esercizio {index + 1}</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Es. Panca Piana" 
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{ marginTop: '1.5rem', padding: '0.75rem' }} 
                  onClick={() => removeExercise(exercise.id)}
                  aria-label="Rimuovi Esercizio"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="sets-list">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                  <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Serie</span>
                  <span style={{ flex: 2, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kg</span>
                  <span style={{ flex: 2, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ripetizioni</span>
                  <span style={{ width: '40px' }}></span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                      {setIndex + 1}
                    </div>
                    <div style={{ flex: 2 }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Kg" 
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Reps" 
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value, 10) || 0)}
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                    <button 
                      className="btn" 
                      style={{ width: '40px', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }} 
                      onClick={() => removeSet(exercise.id, set.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                <button 
                  className="btn" 
                  onClick={() => addSet(exercise.id)}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.875rem', borderStyle: 'dashed' }}
                >
                  <Plus size={16} /> Aggiungi Serie
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn" onClick={addExercise} style={{ width: '100%', marginBottom: '1.5rem' }}>
          <Plus size={18} /> Aggiungi Esercizio
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={onCancel} style={{ flex: 1 }}>Annulla</button>
          <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2 }}>
            <Save size={18} /> Salva Allenamento
          </button>
        </div>
      </div>

      {showEmptyAlert && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Allenamento Vuoto</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Aggiungi almeno un esercizio con una serie valida prima di salvare l'allenamento.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowEmptyAlert(false)}>
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
