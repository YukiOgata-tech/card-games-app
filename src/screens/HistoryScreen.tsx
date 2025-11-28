import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { HistoryEntry } from '../lib/types';
import { RootStackParamList } from '../navigation/types';
import { useHistoryStore } from '../state/useHistoryStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { entries, clear } = useHistoryStore();

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('Result', { summary: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.game}</Text>
        <Text style={styles.badge}>LV{item.difficulty}</Text>
      </View>
      <Text style={styles.meta}>
        {new Date(item.timestamp).toLocaleString()} / 結果: {item.outcome} / ターン: {item.turns}
      </Text>
      <Text style={styles.note} numberOfLines={2}>
        {item.notes}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>履歴</Text>
          <Pressable style={styles.clearButton} onPress={clear}>
            <Text style={styles.clearText}>クリア</Text>
          </Pressable>
        </View>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>まだ履歴がありません。</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d1321',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    color: '#f7f7ff',
    fontSize: 22,
    fontWeight: '800',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#4f8ef7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: {
    color: '#d9e0f2',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2b47',
    backgroundColor: '#11182b',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#f7f7ff',
    fontWeight: '700',
    fontSize: 16,
  },
  badge: {
    color: '#9aa5ce',
    fontSize: 12,
  },
  meta: {
    color: '#cdd2e0',
    marginTop: 4,
    fontSize: 12,
  },
  note: {
    color: '#c9d1ec',
    marginTop: 6,
  },
  empty: {
    color: '#cdd2e0',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;
