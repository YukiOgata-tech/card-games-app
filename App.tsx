import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ResultScreen from './src/screens/ResultScreen';
import { RootStackParamList } from './src/navigation/types';
import { useHistoryStore } from './src/state/useHistoryStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const hydrate = useHistoryStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#0d1321' },
            headerTintColor: '#f7f7ff',
            contentStyle: { backgroundColor: '#0d1321' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'カードゲーム集' }} />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={({ route }) => ({ title: `プレイ: ${route.params.game}` })}
          />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: '結果' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: '履歴' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
