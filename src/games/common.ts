import { Card } from '../lib/types';
import { countSequences, describeCard, splitByRank } from '../lib/cards';

export const pairScore = (hand: Card[]): { pairs: number; triples: number; quads: number } => {
  const rankMap = splitByRank(hand);
  let pairs = 0;
  let triples = 0;
  let quads = 0;
  rankMap.forEach((cards) => {
    if (cards.length === 2) pairs += 1;
    if (cards.length === 3) triples += 1;
    if (cards.length >= 4) quads += 1;
  });
  return { pairs, triples, quads };
};

export const sequenceScore = (hand: Card[]): number => {
  return countSequences(hand);
};

export const cardListLabel = (cards: Card[]): string => cards.map((card) => describeCard(card)).join(', ');
