import { handAverage, buildDeck, shuffleDeck } from '../lib/cards';
import { GameSimulation } from '../lib/types';
import { cardListLabel, pairScore, sequenceScore } from './common';

const evaluateDaifugoHand = (hand: ReturnType<typeof buildDeck>, difficulty: number) => {
  const average = handAverage(hand);
  const pairs = pairScore(hand);
  const sequenceLength = sequenceScore(hand);
  const comboScore = pairs.pairs * 2 + pairs.triples * 3 + pairs.quads * 5 + sequenceLength * 1.4;
  const safetyBias = (11 - difficulty) * 0.3;
  const randomSwing = (Math.random() - 0.5) * (8 - Math.min(difficulty, 8));
  return average * 0.5 + comboScore * (0.6 + difficulty * 0.05) - safetyBias + randomSwing;
};

export const simulateDaifugo = (difficulty: number): GameSimulation => {
  const deck = shuffleDeck(buildDeck(false));
  const playerHand = deck.slice(0, 13);
  const cpuHand = deck.slice(13, 26);
  const tableCards = deck.slice(26, 32);

  const cpuScore = evaluateDaifugoHand(cpuHand, difficulty);
  const playerScore = evaluateDaifugoHand(playerHand, Math.min(8, Math.round(difficulty * 0.7) + 2));
  const margin = playerScore - cpuScore;

  let outcome: GameSimulation['outcome'] = 'draw';
  if (margin > 2) {
    outcome = 'win';
  } else if (margin < -2) {
    outcome = 'lose';
  } else {
    outcome = margin > 0 ? 'win' : margin < 0 ? 'lose' : 'draw';
  }

  const breakdown: string[] = [
    `CPU 戦略: LV${difficulty} / ペア ${pairScore(cpuHand).pairs}・連番 ${sequenceScore(cpuHand)}`,
    `プレイヤー手札平均: ${handAverage(playerHand).toFixed(1)} vs CPU ${handAverage(cpuHand).toFixed(1)}`,
    `場の流れカード: ${cardListLabel(tableCards) || 'なし'}`,
  ];

  return {
    game: 'daifugo',
    difficulty,
    outcome,
    turns: 8,
    notes:
      difficulty >= 9
        ? '革命や温存も視野に入れた最適化を試みました。'
        : difficulty >= 5
          ? '危険札を避けつつ場を流す慎重な CPU を想定しました。'
          : '出せる中で弱い札を優先する CPU を想定しました。',
    playerHand,
    cpuHand,
    tableCards,
    scoreBreakdown: breakdown,
  };
};
