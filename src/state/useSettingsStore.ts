import { create } from 'zustand';

import { GameType } from '../lib/types';

interface SettingsState {
  selectedGame: GameType;
  difficulty: number;
  setGame: (game: GameType) => void;
  setDifficulty: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  selectedGame: 'daifugo',
  difficulty: 3,
  setGame: (game) => set({ selectedGame: game }),
  setDifficulty: (value) => set({ difficulty: Math.min(10, Math.max(1, Math.round(value))) }),
}));
