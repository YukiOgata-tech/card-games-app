export type GameType = 'daifugo' | 'oldMaid' | 'sevens' | 'blackjack' | 'poker';

export type GameOutcome = 'win' | 'lose' | 'draw';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'JOKER';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface GameSimulation {
  game: GameType;
  difficulty: number;
  outcome: GameOutcome;
  turns: number;
  notes: string;
  playerHand: Card[];
  cpuHand: Card[];
  tableCards: Card[];
  scoreBreakdown?: string[];
}

export interface HistoryEntry extends GameSimulation {
  id: string;
  timestamp: number;
}
