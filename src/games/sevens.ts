import { buildDeck, shuffleDeck } from '../lib/cards';
import { Rank } from '../lib/types';
import { GameSimulation } from '../lib/types';
import { cardListLabel } from './common';

const middleControl = (hand: ReturnType<typeof buildDeck>): number => {
  const targets = new Set<Rank>(['6', '7', '8']);
  return hand.filter((c) => targets.has(c.rank)).length;
};

export const simulateSevens = (difficulty: number): GameSimulation => {
  const deck = shuffleDeck(buildDeck(false));
  const playerHand = deck.slice(0, 9);
  const cpuHand = deck.slice(9, 18);
  const tableCards = deck.slice(18, 22);

  const passAllowance = Math.max(1, Math.round((11 - difficulty) / 2));
  const cpuPassReserve = Math.max(1, passAllowance + Math.round(difficulty / 3));
  const controlDiff = middleControl(cpuHand) - middleControl(playerHand);
  const patience = difficulty * 0.3;
  const luck = (Math.random() - 0.5) * 1.2;

  const cpuScore = cpuPassReserve * 0.7 + controlDiff * 1.4 + patience + luck;
  const playerScore = passAllowance * 0.9 - controlDiff * 1.1 + (Math.random() - 0.5);

  const outcome: GameSimulation['outcome'] =
    playerScore > cpuScore ? 'win' : Math.abs(playerScore - cpuScore) < 0.5 ? 'draw' : 'lose';

  const breakdown = [
    `パス回数: プレイヤー ${passAllowance} / CPU ${cpuPassReserve}`,
    `中域（6-8）保持枚数: プレイヤー ${middleControl(playerHand)} / CPU ${middleControl(cpuHand)}`,
    `運要素: ${luck.toFixed(2)}`,
  ];

  return {
    game: 'sevens',
    difficulty,
    outcome,
    turns: 7,
    notes:
      difficulty >= 8
        ? 'CPU は詰みにくい配置を優先し、パス温存を意識します。'
        : difficulty >= 5
          ? 'CPU は中域カードを守りつつ、バランスよく展開します。'
          : 'CPU はパスを消費しやすく、詰みやすい手札管理になります。',
    playerHand,
    cpuHand,
    tableCards,
    scoreBreakdown: [...breakdown, `スタート場札: ${cardListLabel(tableCards) || 'なし'}`],
  };
};
