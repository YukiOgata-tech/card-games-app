import { GameType, HistoryEntry } from '../lib/types';

export type RootStackParamList = {
  Home: undefined;
  Game: { game: GameType; difficulty: number };
  Result: { summary: HistoryEntry };
  History: undefined;
};
