import { createMMKV } from 'react-native-mmkv';

import { HistoryEntry } from './types';

export const storage = createMMKV({ id: 'rn-card-games' });

const HISTORY_KEY = 'history';

export const loadHistory = (): HistoryEntry[] => {
  const raw = storage.getString(HISTORY_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to parse history', error);
    return [];
  }
};

export const persistHistory = (entries: HistoryEntry[]): void => {
  storage.set(HISTORY_KEY, JSON.stringify(entries));
};
