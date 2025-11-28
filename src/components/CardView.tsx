import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { Card, Rank, Suit } from '../lib/types';

const CARD_BACK = require('../../assets/cards/hayeah/back.png');

const faceMap: Record<Suit, Partial<Record<Rank, any>>> = {
  hearts: {
    A: require('../../assets/cards/hayeah/ace_of_hearts.png'),
    '2': require('../../assets/cards/hayeah/2_of_hearts.png'),
    '3': require('../../assets/cards/hayeah/3_of_hearts.png'),
    '4': require('../../assets/cards/hayeah/4_of_hearts.png'),
    '5': require('../../assets/cards/hayeah/5_of_hearts.png'),
    '6': require('../../assets/cards/hayeah/6_of_hearts.png'),
    '7': require('../../assets/cards/hayeah/7_of_hearts.png'),
    '8': require('../../assets/cards/hayeah/8_of_hearts.png'),
    '9': require('../../assets/cards/hayeah/9_of_hearts.png'),
    '10': require('../../assets/cards/hayeah/10_of_hearts.png'),
    J: require('../../assets/cards/hayeah/jack_of_hearts.png'),
    Q: require('../../assets/cards/hayeah/queen_of_hearts.png'),
    K: require('../../assets/cards/hayeah/king_of_hearts.png'),
  },
  diamonds: {
    A: require('../../assets/cards/hayeah/ace_of_diamonds.png'),
    '2': require('../../assets/cards/hayeah/2_of_diamonds.png'),
    '3': require('../../assets/cards/hayeah/3_of_diamonds.png'),
    '4': require('../../assets/cards/hayeah/4_of_diamonds.png'),
    '5': require('../../assets/cards/hayeah/5_of_diamonds.png'),
    '6': require('../../assets/cards/hayeah/6_of_diamonds.png'),
    '7': require('../../assets/cards/hayeah/7_of_diamonds.png'),
    '8': require('../../assets/cards/hayeah/8_of_diamonds.png'),
    '9': require('../../assets/cards/hayeah/9_of_diamonds.png'),
    '10': require('../../assets/cards/hayeah/10_of_diamonds.png'),
    J: require('../../assets/cards/hayeah/jack_of_diamonds.png'),
    Q: require('../../assets/cards/hayeah/queen_of_diamonds.png'),
    K: require('../../assets/cards/hayeah/king_of_diamonds.png'),
  },
  clubs: {
    A: require('../../assets/cards/hayeah/ace_of_clubs.png'),
    '2': require('../../assets/cards/hayeah/2_of_clubs.png'),
    '3': require('../../assets/cards/hayeah/3_of_clubs.png'),
    '4': require('../../assets/cards/hayeah/4_of_clubs.png'),
    '5': require('../../assets/cards/hayeah/5_of_clubs.png'),
    '6': require('../../assets/cards/hayeah/6_of_clubs.png'),
    '7': require('../../assets/cards/hayeah/7_of_clubs.png'),
    '8': require('../../assets/cards/hayeah/8_of_clubs.png'),
    '9': require('../../assets/cards/hayeah/9_of_clubs.png'),
    '10': require('../../assets/cards/hayeah/10_of_clubs.png'),
    J: require('../../assets/cards/hayeah/jack_of_clubs.png'),
    Q: require('../../assets/cards/hayeah/queen_of_clubs.png'),
    K: require('../../assets/cards/hayeah/king_of_clubs.png'),
  },
  spades: {
    A: require('../../assets/cards/hayeah/ace_of_spades.png'),
    '2': require('../../assets/cards/hayeah/2_of_spades.png'),
    '3': require('../../assets/cards/hayeah/3_of_spades.png'),
    '4': require('../../assets/cards/hayeah/4_of_spades.png'),
    '5': require('../../assets/cards/hayeah/5_of_spades.png'),
    '6': require('../../assets/cards/hayeah/6_of_spades.png'),
    '7': require('../../assets/cards/hayeah/7_of_spades.png'),
    '8': require('../../assets/cards/hayeah/8_of_spades.png'),
    '9': require('../../assets/cards/hayeah/9_of_spades.png'),
    '10': require('../../assets/cards/hayeah/10_of_spades.png'),
    J: require('../../assets/cards/hayeah/jack_of_spades.png'),
    Q: require('../../assets/cards/hayeah/queen_of_spades.png'),
    K: require('../../assets/cards/hayeah/king_of_spades.png'),
  },
  joker: {
    JOKER: require('../../assets/cards/hayeah/red_joker.png'),
  },
};

interface Props {
  card: Card;
  hidden?: boolean;
  mini?: boolean;
}

export const CardView: React.FC<Props> = ({ card, hidden = false, mini = false }) => {
  const size = mini ? { width: 42, height: 62 } : { width: 90, height: 130 };
  if (hidden) {
    return <Image source={CARD_BACK} style={[styles.card, size]} resizeMode="cover" />;
  }
  const source = faceMap[card.suit]?.[card.rank] ?? CARD_BACK;

  return <Image source={source} style={[styles.card, size]} resizeMode="contain" />;
};

const styles = StyleSheet.create({
  card: {
    marginRight: 4,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    backgroundColor: '#fff',
  },
});

export default CardView;
