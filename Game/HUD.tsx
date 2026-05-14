import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EATS_PER_LEVEL } from './levelConfig';

interface Props {
  level: number;
  score: number;
  fishEaten: number;
}

export function HUD({ level, score, fishEaten }: Props) {
  return (
    <View style={styles.hud}>
      <View style={styles.pill}>
        <Text style={styles.label}>LEVEL</Text>
        <Text style={styles.value}>{level}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.label}>EATEN</Text>
        <Text style={styles.value}>{fishEaten} / {EATS_PER_LEVEL}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 30,
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 74,
    marginHorizontal: 5,
  },
  label: { fontSize: 9, color: '#7de8ff', fontWeight: 'bold', letterSpacing: 1 },
  value: { fontSize: 17, color: '#fff', fontWeight: 'bold' },
});
