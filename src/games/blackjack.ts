import { buildDeck, shuffleDeck } from '../lib/cards';
import { Card, GameSimulation } from '../lib/types';

const handTotal = (hand: Card[]): { total: number; soft: boolean } => {
  let total = 0;
  let aces = 0;
  hand.forEach((card) => {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  });
  let soft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
    soft = true;
  }
  return { total, soft };
};

const drawUntil = (hand: Card[], deck: Card[], limit: number, flex: number): Card[] => {
  let working = [...hand];
  const pool = [...deck];
  while (handTotal(working).total < limit && pool.length > 0) {
    const next = pool.shift();
    if (!next) break;
    working = [...working, next];
  }
  if (flex > 0 && handTotal(working).total < limit + flex && pool.length > 0) {
    const next = pool.shift();
    if (next) working = [...working, next];
  }
  return working;
};

export const simulateBlackjack = (difficulty: number): GameSimulation => {
  const deck = shuffleDeck(buildDeck(false));
  const playerHand = deck.slice(0, 2);
  const cpuHand = deck.slice(2, 4);
  const remaining = deck.slice(4);

  const playerTarget = 15 + Math.round(difficulty / 2);
  const cpuTarget = 16 + Math.round(difficulty / 3);
  const cpuFlex = difficulty >= 8 ? 2 : 0;

  const playerFinal = drawUntil(playerHand, remaining, playerTarget, 0);
  const dealerDeckStart = remaining.slice(Math.max(0, playerFinal.length - playerHand.length));
  const cpuFinal = drawUntil(cpuHand, dealerDeckStart, cpuTarget, cpuFlex);

  const playerTotal = handTotal(playerFinal).total;
  const cpuTotal = handTotal(cpuFinal).total;

  let outcome: GameSimulation['outcome'] = 'draw';
  if (playerTotal > 21 && cpuTotal > 21) {
    outcome = 'draw';
  } else if (playerTotal > 21) {
    outcome = 'lose';
  } else if (cpuTotal > 21) {
    outcome = 'win';
  } else if (playerTotal > cpuTotal) {
    outcome = 'win';
  } else if (playerTotal < cpuTotal) {
    outcome = 'lose';
  }

  return {
    game: 'blackjack',
    difficulty,
    outcome,
    turns: playerFinal.length + cpuFinal.length,
    notes:
      difficulty >= 8
        ? 'ディーラーはソフト 17 でもヒットを選びやすく、デッキ枚数にも余裕があります。'
        : difficulty >= 5
          ? 'ディーラーは16でスタンド、状況により追加ヒットを判断します。'
          : '低難易度ではデッキが薄く、ディーラーも早めにスタンドします。',
    playerHand: playerFinal,
    cpuHand: cpuFinal,
    tableCards: deck.slice(0, 1),
    scoreBreakdown: [
      `プレイヤー合計: ${playerTotal}`,
      `ディーラー合計: ${cpuTotal}`,
      `ヒット閾値: プレイヤー ${playerTarget} / CPU ${cpuTarget}${cpuFlex ? ` (+${cpuFlex} 柔軟)` : ''}`,
    ],
  };
};
