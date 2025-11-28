import { Card, Rank, Suit } from './types';

export const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const ranks: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

const rankValues: Record<Rank, number> = {
  A: 14,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  JOKER: 15,
};

export const buildDeck = (includeJokers = true): Card[] => {
  const deck: Card[] = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      const id = `${rank}-${suit}`;
      deck.push({ id, suit, rank, value: rankValues[rank] });
    });
  });
  if (includeJokers) {
    deck.push({ id: 'joker-1', suit: 'joker', rank: 'JOKER', value: rankValues.JOKER });
    deck.push({ id: 'joker-2', suit: 'joker', rank: 'JOKER', value: rankValues.JOKER });
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const drawCards = (deck: Card[], count: number): { hand: Card[]; remaining: Card[] } => {
  const hand = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { hand, remaining };
};

export const describeCard = (card: Card): string => {
  const suitLabel: Record<Suit, string> = {
    hearts: 'H',
    diamonds: 'D',
    clubs: 'C',
    spades: 'S',
    joker: 'JOKER',
  };
  return `${card.rank}${card.suit === 'joker' ? '' : suitLabel[card.suit]}`;
};

export const handAverage = (hand: Card[]): number => {
  if (hand.length === 0) {
    return 0;
  }
  return hand.reduce((sum, card) => sum + card.value, 0) / hand.length;
};

export const splitByRank = (hand: Card[]): Map<Rank, Card[]> => {
  const map = new Map<Rank, Card[]>();
  hand.forEach((card) => {
    const list = map.get(card.rank) ?? [];
    list.push(card);
    map.set(card.rank, list);
  });
  return map;
};

export const countSequences = (hand: Card[]): number => {
  const sorted = [...hand].filter((c) => c.suit !== 'joker').sort((a, b) => a.value - b.value);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].value === sorted[i - 1].value + 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (sorted[i].value !== sorted[i - 1].value) {
      current = 1;
    }
  }
  return longest;
};

export const hasFlush = (hand: Card[]): boolean => {
  const nonJokers = hand.filter((c) => c.suit !== 'joker');
  if (nonJokers.length < 5) {
    return false;
  }
  return suits.some((suit) => nonJokers.filter((c) => c.suit === suit).length >= 5);
};
