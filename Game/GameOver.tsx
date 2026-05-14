import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Animated } from 'react-native';

interface Props {
  score: number;
  level: number;
  onRestart: () => void;
}

export function GameOver({ score, level, onRestart }: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(shake, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <ImageBackground source={require('../assets/Bg/Bg.png')} style={styles.bg} resizeMode="cover">
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Animated.Text style={[styles.title, { transform: [{ translateX: shake }] }]}>
          GAME OVER
        </Animated.Text>
        <Text style={styles.sub}>You reached Level {level}</Text>
        <Text style={styles.score}>{score} pts</Text>
        <TouchableOpacity style={styles.btn} onPress={onRestart} activeOpacity={0.85}>
          <Text style={styles.btnText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(160,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  sub: { fontSize: 20, color: '#ffcccc', marginBottom: 8 },
  score: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 32 },
  btn: {
    paddingHorizontal: 44,
    paddingVertical: 16,
    backgroundColor: '#ff3333',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
  },
  btnText: { fontSize: 20, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
});
