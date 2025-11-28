import React, { useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CardView from '../components/CardView';
import { simulateGame } from '../games';
import { GameSimulation } from '../lib/types';
import { RootStackParamList } from '../navigation/types';
import { useHistoryStore } from '../state/useHistoryStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type Route = RouteProp<RootStackParamList, 'Game'>;

const gameTitle: Record<GameSimulation['game'], string> = {
  daifugo: '大富豪',
  oldMaid: 'ババ抜き',
  sevens: '7 並べ',
  blackjack: 'ブラックジャック',
  poker: 'ポーカー',
};

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { addEntry } = useHistoryStore();
  const { game, difficulty } = route.params;

  const [simulation, setSimulation] = useState<GameSimulation>(() => simulateGame(game, difficulty));
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    setSimulation(simulateGame(game, difficulty));
    setLastUpdated(Date.now());
  }, [game, difficulty]);

  const cpuHiddenPreview = useMemo(() => simulation.cpuHand.slice(0, 5), [simulation.cpuHand]);

  const handleSimulate = () => {
    setSimulation(simulateGame(game, difficulty));
    setLastUpdated(Date.now());
  };

  const handleFinish = () => {
    const entry = addEntry(simulation);
    navigation.navigate('Result', { summary: entry });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{gameTitle[game]}</Text>
          <Text style={styles.subtitle}>難易度: LV{difficulty} / 更新: {new Date(lastUpdated).toLocaleTimeString()}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>プレイヤー手札</Text>
          <View style={styles.cardRow}>
            {simulation.playerHand.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>CPU 手札 (一部伏せ)</Text>
          <View style={styles.cardRow}>
            {cpuHiddenPreview.map((card, index) => (
              <CardView key={card.id} card={card} hidden={index % 2 === 0} mini />
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>場のカード</Text>
          <View style={styles.cardRow}>
            {simulation.tableCards.map((card) => (
              <CardView key={card.id} card={card} mini />
            ))}
            {simulation.tableCards.length === 0 && <Text style={styles.text}>まだ場にカードはありません。</Text>}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>推定ロジック</Text>
          <Text style={styles.text}>{simulation.notes}</Text>
          {simulation.scoreBreakdown?.map((line) => (
            <Text key={line} style={styles.breakdown}>
              • {line}
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={handleSimulate}>
            <Text style={styles.secondaryText}>シミュレーションを更新</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleFinish}>
            <Text style={styles.primaryText}>結果へ進む</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: '#f7f7ff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#bfc6e0',
    marginTop: 4,
  },
  panel: {
    backgroundColor: '#11182b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2b47',
  },
  panelTitle: {
    color: '#f7f7ff',
    fontWeight: '700',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  text: {
    color: '#d9deee',
    lineHeight: 18,
  },
  breakdown: {
    color: '#c9d1ec',
    marginTop: 4,
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#3478f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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

export default GameScreen;
