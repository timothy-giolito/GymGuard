import localforage from 'localforage';

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name?: string;
  date: string; // ISO string
  exercises: WorkoutExercise[];
  notes?: string;
  userId?: string;
}

const STORE_KEY = 'gymguard_workouts';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const workoutStore = {
  async getWorkouts(): Promise<WorkoutSession[]> {
    const workouts = await localforage.getItem<WorkoutSession[]>(STORE_KEY);
    return workouts || [];
  },

  async saveWorkout(workout: WorkoutSession): Promise<void> {
    const workouts = await this.getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    
    // Sort by date descending
    workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await localforage.setItem(STORE_KEY, workouts);
  },

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    const updated = workouts.filter(w => w.id !== id);
    await localforage.setItem(STORE_KEY, updated);
  },

  async getLastWorkout(): Promise<WorkoutSession | null> {
    const workouts = await this.getWorkouts();
    if (workouts.length === 0) return null;
    return workouts[0]; // Already sorted descending by date
  },
  
  createId: generateId
};
