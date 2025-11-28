import { simulateBlackjack } from './blackjack';
import { simulateDaifugo } from './daifugo';
import { simulateOldMaid } from './oldMaid';
import { simulatePoker } from './poker';
import { simulateSevens } from './sevens';
import { GameSimulation, GameType } from '../lib/types';

export const simulateGame = (game: GameType, difficulty: number): GameSimulation => {
  switch (game) {
    case 'daifugo':
      return simulateDaifugo(difficulty);
    case 'oldMaid':
      return simulateOldMaid(difficulty);
    case 'sevens':
      return simulateSevens(difficulty);
    case 'blackjack':
      return simulateBlackjack(difficulty);
    case 'poker':
      return simulatePoker(difficulty);
    default:
      return simulateDaifugo(difficulty);
  }
};
