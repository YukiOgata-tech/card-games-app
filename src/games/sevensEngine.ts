import { buildDeck, ranks, shuffleDeck } from '../lib/cards';
import { Card, GameSimulation, Suit } from '../lib/types';

type Turn = 'player' | 'cpu';
type Status = 'playing' | 'playerWon' | 'cpuWon' | 'stuck';

export interface SevensState {
  board: Record<Suit, boolean[]>;
  tableCards: Card[];
  playerHand: Card[];
  cpuHand: Card[];
  turn: Turn;
  playerPasses: number;
  cpuPasses: number;
  playerPassesMax: number;
  cpuPassesMax: number;
  status: Status;
  log: string[];
  difficulty: number;
  turnCount: number;
}

const rankToIndex = (rank: Card['rank']): number => {
  return ranks.indexOf(rank);
};

const initBoard = (): Record<Suit, boolean[]> => ({
  hearts: Array(13).fill(false),
  diamonds: Array(13).fill(false),
  clubs: Array(13).fill(false),
  spades: Array(13).fill(false),
  joker: Array(13).fill(false),
});

const removeCard = (hand: Card[], id: string): Card[] => hand.filter((c) => c.id !== id);

const passAllowanceForCpu = (difficulty: number): number => {
  if (difficulty >= 9) return 2;
  if (difficulty >= 7) return 3;
  if (difficulty >= 4) return 4;
  return 5;
};

const passAllowanceForPlayer = (): number => 4;

export const playableCards = (hand: Card[], board: Record<Suit, boolean[]>): Card[] => {
  return hand.filter((card) => {
    if (card.suit === 'joker') return false;
    const idx = rankToIndex(card.rank);
    const row = board[card.suit];
    if (row[idx]) return false;
    const hasLower = idx > 0 && row[idx - 1];
    const hasUpper = idx < 12 && row[idx + 1];
    return hasLower || hasUpper;
  });
};

export const createSevensGame = (difficulty: number): SevensState => {
  const deck = shuffleDeck(buildDeck(false));
  let playerHand = deck.slice(0, 26);
  let cpuHand = deck.slice(26, 52);
  const board = initBoard();
  const tableCards: Card[] = [];

  // 7 を場に出しておく
  const placeInitialSeven = (suit: Suit) => {
    const sevenId = `7-${suit}`;
    const fromPlayer = playerHand.find((c) => c.id === sevenId);
    const fromCpu = cpuHand.find((c) => c.id === sevenId);
    if (fromPlayer) playerHand = removeCard(playerHand, sevenId);
    if (fromCpu) cpuHand = removeCard(cpuHand, sevenId);
    const idx = rankToIndex('7');
    board[suit][idx] = true;
    tableCards.push({ id: sevenId, suit, rank: '7', value: 7 });
  };

  placeInitialSeven('hearts');
  placeInitialSeven('diamonds');
  placeInitialSeven('clubs');
  placeInitialSeven('spades');

  return {
    board,
    tableCards,
    playerHand,
    cpuHand,
    turn: 'player',
    playerPasses: 0,
    cpuPasses: 0,
    playerPassesMax: passAllowanceForPlayer(),
    cpuPassesMax: passAllowanceForCpu(difficulty),
    status: 'playing',
    log: ['ゲーム開始。あなたのターンです。'],
    difficulty,
    turnCount: 1,
  };
};

const cardRisk = (card: Card): number => {
  const idx = rankToIndex(card.rank);
  if (idx <= 1 || idx >= 11) return 3; // A,2,K,Q 辺
  if (idx <= 3 || idx >= 9) return 2;
  return 1;
};

const cpuChooseCard = (options: Card[], difficulty: number): Card => {
  const scored = options.map((card) => {
    const risk = cardRisk(card);
    const positional = Math.abs(rankToIndex(card.rank) - 6);
    const difficultyBias = difficulty * 0.1;
    const score = risk * 1.4 + positional * 0.7 - difficultyBias + Math.random() * (8 - difficulty);
    return { card, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0].card;
};

export const applyMove = (state: SevensState, card: Card): SevensState => {
  if (state.status !== 'playing') return state;
  if (card.suit === 'joker') return state;
  const idx = rankToIndex(card.rank);
  const row = state.board[card.suit];
  if (row[idx]) return state;
  const hasLower = idx > 0 && row[idx - 1];
  const hasUpper = idx < 12 && row[idx + 1];
  if (!hasLower && !hasUpper) return state;

  const nextBoard = { ...state.board, [card.suit]: [...row] };
  nextBoard[card.suit][idx] = true;
  const nextTable = [...state.tableCards, card];
  const isPlayer = state.turn === 'player';
  const nextPlayerHand = isPlayer ? removeCard(state.playerHand, card.id) : state.playerHand;
  const nextCpuHand = !isPlayer ? removeCard(state.cpuHand, card.id) : state.cpuHand;
  const nextLog = [
    ...state.log,
    `${isPlayer ? 'あなた' : 'CPU'}: ${card.rank}を${card.suit}に配置`,
  ].slice(-50);

  const nextStatus =
    nextPlayerHand.length === 0
      ? 'playerWon'
      : nextCpuHand.length === 0
        ? 'cpuWon'
        : state.status;

  return withEvaluatedStatus({
    ...state,
    board: nextBoard,
    tableCards: nextTable,
    playerHand: nextPlayerHand,
    cpuHand: nextCpuHand,
    turn: isPlayer ? 'cpu' : 'player',
    status: nextStatus,
    log: nextLog,
    turnCount: state.turnCount + 1,
  });
};

export const applyPass = (state: SevensState): SevensState => {
  if (state.status !== 'playing') return state;
  const isPlayer = state.turn === 'player';
  const passes = isPlayer ? state.playerPasses : state.cpuPasses;
  const maxPasses = isPlayer ? state.playerPassesMax : state.cpuPassesMax;
  if (passes >= maxPasses) return state;
  const nextLog = [...state.log, `${isPlayer ? 'あなた' : 'CPU'}: パス (${passes + 1}/${maxPasses})`].slice(-50);
  const nextState = withEvaluatedStatus({
    ...state,
    playerPasses: isPlayer ? passes + 1 : state.playerPasses,
    cpuPasses: !isPlayer ? passes + 1 : state.cpuPasses,
    turn: isPlayer ? 'cpu' : 'player',
    log: nextLog,
    turnCount: state.turnCount + 1,
  });
  // 上限到達＋出せない場合は敗北
  const playableCount = playableCards(isPlayer ? state.playerHand : state.cpuHand, state.board).length;
  if (passes + 1 >= maxPasses && playableCount === 0) {
    return {
      ...nextState,
      status: isPlayer ? 'cpuWon' : 'playerWon',
      log: [...nextState.log, `${isPlayer ? 'あなた' : 'CPU'}: パス上限で敗北`].slice(-50),
    };
  }
  return nextState;
};

const evaluateStuck = (state: SevensState): Status => {
  const playerPlayable = playableCards(state.playerHand, state.board).length;
  const cpuPlayable = playableCards(state.cpuHand, state.board).length;
  const playerCanPass = state.playerPasses < state.playerPassesMax;
  const cpuCanPass = state.cpuPasses < state.cpuPassesMax;
  if (state.playerPasses >= state.playerPassesMax && playerPlayable === 0) {
    return 'cpuWon';
  }
  if (state.cpuPasses >= state.cpuPassesMax && cpuPlayable === 0) {
    return 'playerWon';
  }
  if (playerPlayable === 0 && cpuPlayable === 0 && !playerCanPass && !cpuCanPass) {
    if (state.playerHand.length === state.cpuHand.length) return 'stuck';
    return state.playerHand.length < state.cpuHand.length ? 'playerWon' : 'cpuWon';
  }
  return state.status;
};

const withEvaluatedStatus = (state: SevensState): SevensState => {
  const status = evaluateStuck(state);
  return { ...state, status };
};

export const cpuTurn = (state: SevensState): SevensState => {
  if (state.status !== 'playing' || state.turn !== 'cpu') return state;
  let working = { ...state };
  const options = playableCards(working.cpuHand, working.board);
  if (options.length === 0) {
    working = applyPass(working);
  } else {
    const choice = cpuChooseCard(options, state.difficulty);
    const bestRisk = cardRisk(choice);
    const passThreshold = state.difficulty >= 8 ? 1.2 : state.difficulty >= 5 ? 2 : 2.5;
    if (bestRisk > passThreshold && working.cpuPasses < working.cpuPassesMax) {
      working = applyPass(working);
    } else {
      working = applyMove(working, choice);
    }
  }
  return withEvaluatedStatus(working);
};

export const buildSevensSimulationSummary = (state: SevensState): GameSimulation => {
  const outcome: GameSimulation['outcome'] =
    state.status === 'playerWon' ? 'win' : state.status === 'cpuWon' ? 'lose' : 'draw';
  return {
    game: 'sevens',
    difficulty: state.difficulty,
    outcome,
    turns: state.turnCount,
    notes: `パス回数 あなた ${state.playerPasses}/${state.playerPassesMax} / CPU ${state.cpuPasses}/${state.cpuPassesMax}`,
    playerHand: state.playerHand,
    cpuHand: state.cpuHand,
    tableCards: state.tableCards,
    scoreBreakdown: state.log.slice(-5),
  };
};
