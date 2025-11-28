import { create } from 'zustand';

import { persistHistory, loadHistory } from '../lib/storage';
import { GameSimulation, HistoryEntry } from '../lib/types';

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: GameSimulation) => HistoryEntry;
  hydrate: () => void;
  clear: () => void;
}

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  addEntry: (entry) => {
    const next: HistoryEntry = {
      ...entry,
      id: buildId(),
      timestamp: Date.now(),
    };
    const updated = [next, ...get().entries].slice(0, 200);
    set({ entries: updated });
    persistHistory(updated);
    return next;
  },
  hydrate: () => {
    const saved = loadHistory();
    set({ entries: saved });
  },
  clear: () => {
    set({ entries: [] });
    persistHistory([]);
  },
}));
