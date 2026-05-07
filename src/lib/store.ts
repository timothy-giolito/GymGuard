import localforage from 'localforage';

// Configure localforage instance
localforage.config({
  name: 'GymGuard',
  version: 1.0,
  storeName: 'gymguard_data', // Should be alphanumeric, with underscores.
  description: 'GymGuard local storage for subscriptions, timers, and workout files'
});

export const store = {
  async setItem<T>(key: string, value: T): Promise<T> {
    try {
      return await localforage.setItem(key, value);
    } catch (err) {
      console.error('Error saving data', err);
      throw err;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      return await localforage.getItem<T>(key);
    } catch (err) {
      console.error('Error reading data', err);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (err) {
      console.error('Error removing data', err);
    }
  }
};
