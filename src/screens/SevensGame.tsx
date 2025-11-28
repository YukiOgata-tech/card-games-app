import React, { useEffect, useMemo, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import CardView from '../components/CardView';
import {
  SevensState,
  applyMove,
  applyPass,
  buildSevensSimulationSummary,
  cpuTurn,
  createSevensGame,
  playableCards,
} from '../games/sevensEngine';
import { Card } from '../lib/types';
import { RootStackParamList } from '../navigation/types';
import { useHistoryStore } from '../state/useHistoryStore';
import { ranks } from '../lib/cards';

interface Props {
  difficulty: number;
}

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const SuitRow: React.FC<{
  suit: Card['suit'];
  board: boolean[];
}> = ({ suit, board }) => {
  const labelMap: Record<Card['suit'], string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
    joker: 'Jk',
  };

  const rankValue: Record<string, number> = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
  };

  const items = ranks.map((rank, idx) => {
    const placed = board[idx];
    return { rank, placed };
  });

  return (
    <View style={styles.row}>
      <Text style={styles.suit}>{labelMap[suit]}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardRow}>
        {items.map((item, idx) =>
          item.placed ? (
            <CardView
              key={`${suit}-${item.rank}`}
              mini
              card={{ id: `${suit}-${item.rank}-board`, suit, rank: item.rank as Card['rank'], value: rankValue[item.rank] ?? 0 }}
            />
          ) : (
            <View key={`${suit}-${item.rank}`} style={styles.emptySlot}>
              <Text style={styles.slotText}>{item.rank}</Text>
            </View>
          ),
        )}
      </ScrollView>
    </View>
  );
};

export const SevensGame: React.FC<Props> = ({ difficulty }) => {
  const navigation = useNavigation<Navigation>();
  const { addEntry } = useHistoryStore();
  const [state, setState] = useState<SevensState>(() => createSevensGame(difficulty));
  const [finished, setFinished] = useState(false);
  const [sortMode, setSortMode] = useState<'suit' | 'rank' | 'playable'>('playable');

  useEffect(() => {
    setState(createSevensGame(difficulty));
    setFinished(false);
  }, [difficulty]);

  useEffect(() => {
    if (state.turn === 'cpu' && state.status === 'playing') {
      const timer = setTimeout(() => setState((prev) => cpuTurn(prev)), 320);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.turn, state.status]);

  useEffect(() => {
    if (state.status !== 'playing' && !finished) {
      setFinished(true);
      const summary = buildSevensSimulationSummary(state);
      const entry = addEntry(summary);
      navigation.navigate('Result', { summary: entry });
      // 次ゲームを即座に用意しておく（戻ったときに新規スタート）
      setTimeout(() => {
        setState(createSevensGame(difficulty));
        setFinished(false);
      }, 50);
    }
  }, [state.status, navigation, addEntry, state, finished]);

  const playable = useMemo(() => playableCards(state.playerHand, state.board).map((c) => c.id), [state]);
  const sortedHand = useMemo(() => {
    const suitOrder: Record<Card['suit'], number> = { hearts: 0, diamonds: 1, clubs: 2, spades: 3, joker: 4 };
    const rankValue: Record<string, number> = {
      A: 14, K: 13, Q: 12, J: 11,
      '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, JOKER: 1,
    };
    const list = [...state.playerHand];
    if (sortMode === 'suit') {
      return list.sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit] || rankValue[b.rank] - rankValue[a.rank]);
    }
    if (sortMode === 'rank') {
      return list.sort((a, b) => rankValue[b.rank] - rankValue[a.rank] || suitOrder[a.suit] - suitOrder[b.suit]);
    }
    // playable: 出せるものを手前、その後はスート/ランク順
    return list.sort((a, b) => {
      const aPlay = playable.includes(a.id) ? 0 : 1;
      const bPlay = playable.includes(b.id) ? 0 : 1;
      if (aPlay !== bPlay) return aPlay - bPlay;
      return rankValue[b.rank] - rankValue[a.rank] || suitOrder[a.suit] - suitOrder[b.suit];
    });
  }, [state.playerHand, sortMode, state.board, playable]);

  const onCardPress = (card: Card) => {
    if (state.turn !== 'player' || state.status !== 'playing') return;
    if (!playable.includes(card.id)) return;
    setState((prev) => applyMove(prev, card));
  };

  const onPass = () => {
    if (state.turn !== 'player' || state.status !== 'playing') return;
    setState((prev) => applyPass(prev));
  };

  const headerText =
    state.status !== 'playing'
      ? state.status === 'playerWon'
        ? 'あなたの勝ち！'
        : state.status === 'cpuWon'
          ? 'CPUの勝ち…'
          : '行き詰まり'
      : state.turn === 'player'
        ? 'あなたのターン'
        : 'CPUのターン';

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={styles.container}>
        <View className="mb-3">
          <Text className="text-2xl font-extrabold text-slate-50">{headerText}</Text>
          <Text className="text-slate-300 mt-1">
            難易度: {difficulty} / パス あなた {state.playerPasses}/{state.playerPassesMax}・CPU {state.cpuPasses}/{state.cpuPassesMax}
          </Text>
        </View>

        <View className="rounded-xl border border-slate-700 bg-slate-900 p-3">
          <Text className="text-slate-50 font-semibold mb-1">操作ガイド</Text>
          <Text className="text-slate-300 leading-5">1) 青枠のカードが「出せる」カードです</Text>
          <Text className="text-slate-300 leading-5">2) カードをタップして場に配置</Text>
          <Text className="text-slate-300 leading-5">3) 出せるカードがなければパス</Text>
        </View>

        <View style={styles.board}>
          <SuitRow suit="hearts" board={state.board.hearts} />
          <SuitRow suit="diamonds" board={state.board.diamonds} />
          <SuitRow suit="clubs" board={state.board.clubs} />
          <SuitRow suit="spades" board={state.board.spades} />
        </View>

        <View className="rounded-xl border border-slate-700 bg-slate-900 p-3 mt-3">
          <Text className="text-slate-50 font-semibold mb-1">あなたの手札</Text>
          <Text className="text-slate-400 leading-5 mb-2">
            1) 青枠が「出せるカード」  2) タップで場に配置  3) 出せなければパス
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-slate-300 mr-2">並び替え:</Text>
            <View className="flex-row">
              {[
                { key: 'playable', label: '出せる優先' },
                { key: 'suit', label: 'マーク順' },
                { key: 'rank', label: '数字順' },
              ].map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSortMode(opt.key as typeof sortMode)}
                  className={`px-3 py-1 rounded-lg mr-2 ${sortMode === opt.key ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <Text className="text-slate-100 text-xs font-semibold">{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.handScroll}
          >
            {sortedHand.map((card, index) => {
              const enabled = playable.includes(card.id);
              const overlap = -50; // カードを重ねる幅（数字が見える程度）
              return (
                <Animated.View
                  key={card.id}
                  entering={FadeInDown.delay(index * 25)}
                  layout={Layout.springify()}
                  style={[styles.stackCard, { marginLeft: index === 0 ? 0 : overlap }]}
                >
                  <Pressable onPress={() => onCardPress(card)} disabled={!enabled}>
                    <View style={[styles.cardShadow, !enabled && styles.cardDisabled]}>
                      <CardView card={card} hidden={false} />
                      {!enabled && <View style={styles.cardMask} />}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              className="items-center rounded-xl border border-indigo-400 px-4 py-3"
              style={state.playerPasses >= state.playerPassesMax || state.status !== 'playing' ? styles.passDisabled : null}
              onPress={onPass}
              disabled={state.playerPasses >= state.playerPassesMax || state.status !== 'playing'}
            >
              <Text className="text-slate-100 font-bold">パスする</Text>
            </Pressable>
          </View>
        </View>

        <View className="rounded-xl border border-slate-700 bg-slate-900 p-3 mt-3">
          <Text className="text-slate-50 font-semibold mb-2">CPU 手札</Text>
          <View style={styles.cpuBadge}>
            <Text style={styles.cpuBadgeText}>残り {state.cpuHand.length} 枚</Text>
          </View>
        </View>

        <View className="rounded-xl border border-slate-700 bg-slate-900 p-3 mt-3 mb-6">
          <Text className="text-slate-50 font-semibold mb-2">ログ</Text>
          <FlatList
            data={[...state.log].reverse()}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => <Text style={styles.logLine}>• {item}</Text>}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1020' },
  container: { padding: 16 },
  header: { color: '#f7f7ff', fontSize: 22, fontWeight: '800' },
  sub: { color: '#cdd2e0', marginTop: 6 },
  guide: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#11182b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#23304f',
  },
  guideTitle: { color: '#f7f7ff', fontWeight: '700', marginBottom: 4 },
  guideText: { color: '#cdd2e0', lineHeight: 18 },
  board: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#11182b',
    borderWidth: 1,
    borderColor: '#1f2b47',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  suit: { width: 26, color: '#f7f7ff', fontWeight: '800', fontSize: 16 },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptySlot: {
    width: 50,
    height: 70,
    borderWidth: 1,
    borderColor: '#23304f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#0f172a',
  },
  slotText: { color: '#9aa5ce', fontSize: 12 },
  section: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#11182b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2b47',
  },
  sectionTitle: { color: '#f7f7ff', fontWeight: '700', marginBottom: 8 },
  handRow: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { marginTop: 8 },
  passButton: {
    borderColor: '#4f8ef7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  passDisabled: { opacity: 0.4 },
  logLine: { color: '#cdd2e0', marginBottom: 4 },
  handScroll: { paddingVertical: 10, paddingHorizontal: 4 },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardDisabled: { opacity: 0.55 },
  cardMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12,14,25,0.45)',
    borderRadius: 10,
  },
  caption: { color: '#9aa5ce', marginBottom: 6, lineHeight: 18 },
  stackCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpuBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#23304f',
  },
  cpuBadgeText: { color: '#f7f7ff', fontWeight: '700' },
});

export default SevensGame;
