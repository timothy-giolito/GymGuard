import localforage from 'localforage';

export interface BodyMetricLog {
  id: string;
  date: string; // ISO String
  weight: number; // kg
  height?: number; // cm
  chest?: number; // cm
  waist?: number; // cm
  arms?: number; // cm
  legs?: number; // cm
  userId: string; // Obbligatorio per la privacy
}

const STORE_KEY = 'gymguard_body_metrics';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const profileStore = {
  async getMetrics(userId: string): Promise<BodyMetricLog[]> {
    if (!userId) throw new Error("userId is required for privacy");
    const metrics = await localforage.getItem<BodyMetricLog[]>(STORE_KEY);
    if (!metrics) return [];
    
    // Filtriamo rigorosamente per l'utente loggato
    return metrics.filter(m => m.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async saveMetric(metric: BodyMetricLog): Promise<void> {
    if (!metric.userId) throw new Error("userId is required for privacy");
    
    let metrics = await localforage.getItem<BodyMetricLog[]>(STORE_KEY) || [];
    
    const existingIndex = metrics.findIndex(m => m.id === metric.id);
    if (existingIndex >= 0) {
      // Assicuriamoci che stiamo sovrascrivendo un log dello stesso utente
      if (metrics[existingIndex].userId !== metric.userId) {
         throw new Error("Unauthorized access to log");
      }
      metrics[existingIndex] = metric;
    } else {
      metrics.push(metric);
    }
    
    await localforage.setItem(STORE_KEY, metrics);
  },

  async deleteMetric(id: string, userId: string): Promise<void> {
    if (!userId) throw new Error("userId is required for privacy");
    
    let metrics = await localforage.getItem<BodyMetricLog[]>(STORE_KEY) || [];
    // Cancella solo se l'id corrisponde e appartiene all'utente
    const updated = metrics.filter(m => !(m.id === id && m.userId === userId));
    
    await localforage.setItem(STORE_KEY, updated);
  },
  
  createId: generateId
};
