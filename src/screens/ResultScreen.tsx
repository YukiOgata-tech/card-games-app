import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import CardView from '../components/CardView';
import { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

const outcomeLabel: Record<string, string> = { win: 'WIN', lose: 'LOSE', draw: 'DRAW' };

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { summary } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>結果: {outcomeLabel[summary.outcome]}</Text>
        <Text style={styles.subtitle}>
          {summary.game} / 難易度 LV{summary.difficulty} / {new Date(summary.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.notes}>{summary.notes}</Text>

        <View style={styles.row}>
          <Text style={styles.heading}>プレイヤー手札</Text>
          <View style={styles.cards}>
            {summary.playerHand.map((card) => (
              <CardView key={card.id} card={card} mini />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.heading}>CPU 手札</Text>
          <View style={styles.cards}>
            {summary.cpuHand.map((card, index) => (
              <CardView key={card.id} card={card} hidden={index % 2 === 0} mini />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.heading}>詳細</Text>
          <Text style={styles.detail}>ターン数: {summary.turns}</Text>
          {summary.scoreBreakdown?.map((line) => (
            <Text key={line} style={styles.detail}>
              • {line}
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Game', { game: summary.game, difficulty: summary.difficulty })}
          >
            <Text style={styles.primaryText}>同じ設定で再戦</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.secondaryText}>ホームへ戻る</Text>
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
    color: '#f7f7ff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cdd2e0',
    marginTop: 4,
  },
  notes: {
    color: '#d9deee',
    marginTop: 8,
    lineHeight: 18,
  },
  row: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#11182b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2b47',
  },
  heading: {
    color: '#f7f7ff',
    fontWeight: '700',
    marginBottom: 6,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detail: {
    color: '#c9d1ec',
    marginTop: 4,
  },
  actions: {
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#3478f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 8,
  },
  secondaryText: {
    color: '#d9e0f2',
    fontWeight: '700',
  },
});

export default ResultScreen;
