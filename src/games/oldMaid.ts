import { buildDeck, shuffleDeck } from '../lib/cards';
import { GameSimulation } from '../lib/types';
import { cardListLabel } from './common';

const stripPairs = (hand: ReturnType<typeof buildDeck>): ReturnType<typeof buildDeck> => {
  const counts = new Map<string, number>();
  hand.forEach((card) => {
    if (card.rank === 'JOKER') return;
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  });
  return hand.filter((card) => {
    if (card.rank === 'JOKER') return true;
    const count = counts.get(card.rank) ?? 0;
    return count % 2 === 1;
  });
};

export const simulateOldMaid = (difficulty: number): GameSimulation => {
  const deck = shuffleDeck(buildDeck(true));
  const playerHand = stripPairs(deck.slice(0, 8 + Math.round(difficulty / 2)));
  const cpuHand = stripPairs(deck.slice(12, 24));
  const tableCards = deck.slice(24, 28);

  const cpuKeepsJoker = Math.random() < (11 - difficulty) * 0.08;
  const cpuReadsPlayer = Math.random() < difficulty * 0.07;
  const luckSwing = (Math.random() - 0.5) * 2.5;

  const playerRisk = playerHand.find((c) => c.rank === 'JOKER') ? 2 : 0;
  const cpuRisk = cpuHand.find((c) => c.rank === 'JOKER') && !cpuKeepsJoker ? 1 : 3;

  const playerScore = playerHand.length - playerRisk + luckSwing + (cpuReadsPlayer ? -0.5 : 0.5);
  const cpuScore = cpuHand.length - cpuRisk + (difficulty * 0.6);

  let outcome: GameSimulation['outcome'] = 'draw';
  if (playerScore < cpuScore - 0.2) {
    outcome = 'win';
  } else if (playerScore > cpuScore + 0.2) {
    outcome = 'lose';
  }

  const breakdown = [
    `CPU 推測力: ${cpuReadsPlayer ? '手札から推測' : 'ランダム選択'}`,
    `JOKER 保持率: ${cpuKeepsJoker ? '維持' : '早期手放し'}`,
    `プレイヤー残り札: ${playerHand.length} / CPU 残り札: ${cpuHand.length}`,
  ];

  return {
    game: 'oldMaid',
    difficulty,
    outcome,
    turns: 6,
    notes:
      difficulty >= 7
        ? 'CPU は引き先を記憶し、JOKER リスクを避けるように動きます。'
        : difficulty >= 4
          ? 'CPU はペア整理を優先しつつ、やや慎重に引き先を決めます。'
          : 'CPU は引き運任せで、JOKER を長く保持しがちです。',
    playerHand,
    cpuHand,
    tableCards,
    scoreBreakdown: [...breakdown, `場に出たカード: ${cardListLabel(tableCards) || 'なし'}`],
  };
};
