import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Animated } from 'react-native';

interface Props {
  level: number;
  score: number;
  onNextLevel: () => void;
}

export function LevelComplete({ level, score, onNextLevel }: Props) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const isGameWon = level >= 20;

  return (
    <ImageBackground source={require('../assets/Bg/Bg.png')} style={styles.bg} resizeMode="cover">
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.levelTag}>LEVEL {level}</Text>
          <Text style={styles.complete}>{isGameWon ? '🏆 YOU WIN!' : 'COMPLETE!'}</Text>
          <Text style={styles.score}>{score} pts</Text>
          {isGameWon ? (
            <Text style={styles.winMsg}>You mastered all 20 levels!</Text>
          ) : (
            <Text style={styles.nextHint}>Level {level + 1} unlocked</Text>
          )}
          <TouchableOpacity style={styles.btn} onPress={onNextLevel} activeOpacity={0.85}>
            <Text style={styles.btnText}>{isGameWon ? 'PLAY AGAIN' : 'NEXT LEVEL →'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,60,20,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 44,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e676',
  },
  levelTag: {
    fontSize: 14,
    color: '#00e676',
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 4,
  },
  complete: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  score: {
    fontSize: 26,
    color: '#b3f0ff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  nextHint: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 24,
  },
  winMsg: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  btn: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    backgroundColor: '#00c853',
    borderRadius: 32,
  },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
});
