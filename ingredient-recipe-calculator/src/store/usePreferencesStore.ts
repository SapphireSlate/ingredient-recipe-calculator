import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStore {
  theme: 'light' | 'dark';
  defaultUnit: string;
  defaultCurrency: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setDefaultUnit: (unit: string) => void;
  setDefaultCurrency: (currency: string) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      defaultUnit: 'g',
      defaultCurrency: 'USD',
      setTheme: (theme) => set({ theme }),
      setDefaultUnit: (unit) => set({ defaultUnit: unit }),
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
    }),
    {
      name: 'preferences-storage',
      skipHydration: false,
    }
  )
); 