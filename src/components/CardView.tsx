import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Card } from '../lib/types';

const CARD_FACE = require('../../assets/cards/card_face_base.png');
const CARD_BACK = require('../../assets/cards/card_back.png');

interface Props {
  card: Card;
  hidden?: boolean;
  mini?: boolean;
}

const suitLabel: Record<Card['suit'], string> = {
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
  spades: 'S',
  joker: 'JK',
};

const suitColor: Record<Card['suit'], string> = {
  hearts: '#d7263d',
  diamonds: '#d7263d',
  clubs: '#111',
  spades: '#111',
  joker: '#1b6eff',
};

export const CardView: React.FC<Props> = ({ card, hidden = false, mini = false }) => {
  const size = mini ? { width: 50, height: 75 } : { width: 90, height: 130 };
  if (hidden) {
    return <Image source={CARD_BACK} style={[styles.card, size]} resizeMode="cover" />;
  }
  return (
    <ImageBackground source={CARD_FACE} style={[styles.card, size]} imageStyle={styles.face} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={[styles.rank, { color: suitColor[card.suit] }]}>{card.rank}</Text>
        <Text style={[styles.suit, { color: suitColor[card.suit] }]}>{suitLabel[card.suit]}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  face: {
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
  },
  suit: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CardView;
