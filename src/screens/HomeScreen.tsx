import React, { useEffect, useMemo, useRef } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameType } from '../lib/types';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../state/useSettingsStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const games: { key: GameType; title: string; detail: string }[] = [
  { key: 'daifugo', title: '大富豪', detail: '危険度評価・階段温存などを難易度別に適用' },
  { key: 'oldMaid', title: 'ババ抜き', detail: 'JOKER の保持率と推測力を調整' },
  { key: 'sevens', title: '7 並べ', detail: 'パス回数と詰み防止ロジックを制御' },
  { key: 'blackjack', title: 'ブラックジャック', detail: 'ディーラーのスタンド条件を変化' },
  { key: 'poker', title: 'ポーカー', detail: '交換判断と役狙いの精度を変化' },
];

const difficulties = Array.from({ length: 10 }, (_, i) => i + 1);

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { selectedGame, difficulty, setGame, setDifficulty } = useSettingsStore();
  const slotRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const cardWidth = 70;
  const cardSpacing = 12;
  const slotSize = cardWidth + cardSpacing;
  const inset = useMemo(() => Math.max(0, (width - slotSize) / 2), [width, slotSize]);

  useEffect(() => {
    slotRef.current?.scrollTo({ x: (difficulty - 1) * slotSize, animated: true });
  }, [difficulty, slotSize]);

  const onSlotEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / slotSize);
    const next = Math.min(9, Math.max(0, index)) + 1;
    setDifficulty(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>トランプ 5 ゲーム</Text>
        <Text style={styles.subtitle}>ゲームを選んで難易度 (1-10) を設定してください。</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ゲーム選択</Text>
          {games.map((game) => {
            const active = selectedGame === game.key;
            return (
              <Pressable
                key={game.key}
                style={[styles.gameCard, active && styles.gameCardActive]}
                onPress={() => setGame(game.key)}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameTag}>{game.key}</Text>
                </View>
                <Text style={styles.gameDetail}>{game.detail}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>難易度</Text>
          <View style={styles.slotShell}>
            <View style={styles.slotWindow}>
              <Animated.ScrollView
                ref={slotRef}
                horizontal
                snapToInterval={slotSize}
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onSlotEnd}
                contentContainerStyle={{
                  alignItems: 'center',
                  paddingHorizontal: inset + cardSpacing / 2,
                }}
              >
                {difficulties.map((level) => {
                  const active = level === difficulty;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => setDifficulty(level)}
                      style={[
                        styles.diffCard,
                        active && styles.diffCardActive,
                        { width: cardWidth, marginHorizontal: cardSpacing / 2 },
                      ]}
                    >
                      <Text style={[styles.slotNumber, active && styles.slotNumberActive]}>{level}</Text>
                      <Text style={[styles.slotLabel, active && styles.slotLabelActive]}>LV{level}</Text>
                    </Pressable>
                  );
                })}
              </Animated.ScrollView>
              <View
                pointerEvents="none"
                style={[styles.slotHighlight, { width: cardWidth + cardSpacing }]}
              />
            </View>
          </View>
          <Text style={styles.caption}>現在: LV{difficulty} / LV1 は運任せ、LV10 は CPU が最適化思考。</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Game', { game: selectedGame, difficulty })}
          >
            <Text style={styles.primaryText}>ゲーム開始</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('History')}>
            <Text style={styles.secondaryText}>履歴を見る</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d1321',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f7f7ff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#d9d9e2',
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#11182b',
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#f7f7ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  gameCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#23304f',
    backgroundColor: '#0f172a',
    marginBottom: 10,
  },
  gameCardActive: {
    borderColor: '#4f8ef7',
    backgroundColor: '#142040',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTitle: {
    color: '#f7f7ff',
    fontSize: 17,
    fontWeight: '700',
  },
  gameTag: {
    color: '#9aa5ce',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  gameDetail: {
    color: '#cdd2e0',
    marginTop: 6,
    lineHeight: 18,
  },
  slotShell: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#23304f',
  },
  slotWindow: {
    height: 120,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  diffCard: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#101828',
    borderWidth: 1,
    borderColor: '#23304f',
  },
  diffCardActive: {
    backgroundColor: '#1f3163',
    borderColor: '#4f8ef7',
  },
  slotNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#f7f7ff',
  },
  slotNumberActive: {
    color: '#fefefe',
  },
  slotLabel: {
    color: '#9aa5ce',
    marginTop: 4,
  },
  slotLabelActive: {
    color: '#dfe5ff',
  },
  slotHighlight: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4f8ef7',
    alignSelf: 'center',
  },
  caption: {
    color: '#9aa5ce',
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#3478f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#f7f7ff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: '#4f8ef7',
    borderWidth: 1,
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#d9e0f2',
    fontWeight: '700',
  },
});

export default HomeScreen;
