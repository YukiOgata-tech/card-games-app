import { buildDeck, shuffleDeck, describeCard } from '../lib/cards';
import { Card, GameSimulation } from '../lib/types';

type HandRank =
  | 'high-card'
  | 'one-pair'
  | 'two-pair'
  | 'three-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-kind'
  | 'straight-flush';

const isStraight = (values: number[]): boolean => {
  const sorted = [...values].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
};

const evaluatePokerHand = (hand: Card[]): { score: number; label: HandRank } => {
  const values = hand.map((c) => c.value === 14 ? 14 : c.value).sort((a, b) => b - a);
  const suits = new Set(hand.map((c) => c.suit));
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const uniqueCounts = Array.from(counts.values()).sort((a, b) => b - a);
  const flush = suits.size === 1;
  const straight = isStraight(values.slice().sort((a, b) => a - b));

  let label: HandRank = 'high-card';
  if (straight && flush) label = 'straight-flush';
  else if (uniqueCounts[0] === 4) label = 'four-kind';
  else if (uniqueCounts[0] === 3 && uniqueCounts[1] === 2) label = 'full-house';
  else if (flush) label = 'flush';
  else if (straight) label = 'straight';
  else if (uniqueCounts[0] === 3) label = 'three-kind';
  else if (uniqueCounts[0] === 2 && uniqueCounts[1] === 2) label = 'two-pair';
  else if (uniqueCounts[0] === 2) label = 'one-pair';

  const rankWeight: Record<HandRank, number> = {
    'high-card': 1,
    'one-pair': 2,
    'two-pair': 3,
    'three-kind': 4,
    straight: 5,
    flush: 6,
    'full-house': 7,
    'four-kind': 8,
    'straight-flush': 9,
  };

  const high = values[0];
  const score = rankWeight[label] * 100 + high;
  return { score, label };
};

const pickDiscards = (hand: Card[], difficulty: number): number[] => {
  const { label } = evaluatePokerHand(hand);
  const suitCounts = new Map<string, number>();
  hand.forEach((card) => suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1));
  const targetSuit = Array.from(suitCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (label === 'straight-flush' || label === 'full-house' || label === 'four-kind') {
    return [];
  }
  if (label === 'flush' || label === 'straight') {
    return difficulty >= 7 ? [] : [0];
  }

  const discards: number[] = [];
  const counts = new Map<number, number>();
  hand.forEach((card) => counts.set(card.value, (counts.get(card.value) ?? 0) + 1));

  hand.forEach((card, index) => {
    const count = counts.get(card.value) ?? 0;
    const inTargetSuit = card.suit === targetSuit;
    const keepForFlush = difficulty >= 6 && inTargetSuit && (suitCounts.get(card.suit) ?? 0) >= 3;
    if (count === 1 && !keepForFlush && discards.length < (difficulty >= 8 ? 2 : 3)) {
      discards.push(index);
    }
  });
  return discards;
};

const exchangeCards = (
  hand: Card[],
  deck: Card[],
  discards: number[],
): { hand: Card[]; remaining: Card[] } => {
  const remainingDeck = [...deck];
  const nextHand = hand.map((card, index) => {
    if (!discards.includes(index)) return card;
    return remainingDeck.shift() ?? card;
  });
  return { hand: nextHand, remaining: remainingDeck };
};

export const simulatePoker = (difficulty: number): GameSimulation => {
  const deck = shuffleDeck(buildDeck(false));
  let playerHand = deck.slice(0, 5);
  let cpuHand = deck.slice(5, 10);
  let remaining = deck.slice(10);

  const playerDiscards = pickDiscards(playerHand, Math.max(4, Math.round(difficulty * 0.7)));
  const cpuDiscards = pickDiscards(cpuHand, difficulty);

  const playerSwap = exchangeCards(playerHand, remaining, playerDiscards);
  playerHand = playerSwap.hand;
  remaining = playerSwap.remaining;
  const cpuSwap = exchangeCards(cpuHand, remaining, cpuDiscards);
  cpuHand = cpuSwap.hand;
  remaining = cpuSwap.remaining;

  const playerEval = evaluatePokerHand(playerHand);
  const cpuEval = evaluatePokerHand(cpuHand);

  let outcome: GameSimulation['outcome'] = 'draw';
  if (playerEval.score > cpuEval.score) {
    outcome = 'win';
  } else if (playerEval.score < cpuEval.score) {
    outcome = 'lose';
  }

  return {
    game: 'poker',
    difficulty,
    outcome,
    turns: 2,
    notes:
      difficulty >= 8
        ? 'CPU は2枚までの交換で役狙いを絞ります。'
        : difficulty >= 5
          ? 'CPU はペア・フラッシュを意識した交換を行います。'
          : 'CPU はランダム性の高い交換をします。',
    playerHand,
    cpuHand,
    tableCards: remaining.slice(0, 3),
    scoreBreakdown: [
      `プレイヤー役: ${playerEval.label} (${describeCard(playerHand[0])}...)`,
      `CPU 役: ${cpuEval.label} (${describeCard(cpuHand[0])}...)`,
      `交換枚数: プレイヤー ${playerDiscards.length} / CPU ${cpuDiscards.length}`,
    ],
  };
};
