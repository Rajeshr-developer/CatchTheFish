import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, ScrollView } from 'react-native';
import { resumeAudio } from './audio';

const HERO_IMAGES = [
  require('../assets/hero/0.png'),
  require('../assets/hero/1.png'),
  require('../assets/hero/2.png'),
  require('../assets/hero/3.png'),
  require('../assets/hero/4.png'),
  require('../assets/hero/5.png'),
  require('../assets/hero/6.png'),
  require('../assets/hero/7.png'),
  require('../assets/hero/8.png'),
  require('../assets/hero/9.png'),
];

interface Props {
  onSelect: (heroIndex: number) => void;
}

export function HeroSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ImageBackground source={require('../assets/Bg/Bg.png')} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Your Fish</Text>
        <Text style={styles.subtitle}>Pick your hero and dive in!</Text>
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {HERO_IMAGES.map((src, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.card, selected === i && styles.selectedCard]}
              onPress={() => setSelected(i)}
              activeOpacity={0.8}
            >
              <Image source={src} style={styles.heroImg} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selected !== null && (
          <TouchableOpacity style={styles.playBtn} onPress={() => { resumeAudio(); onSelect(selected); }} activeOpacity={0.85}>
            <Text style={styles.playText}>▶  PLAY</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,20,50,0.72)',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaddff',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  card: {
    width: 100,
    height: 68,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    margin: 8,
  },
  selectedCard: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0,229,255,0.18)',
  },
  heroImg: { width: 84, height: 48 },
  playBtn: {
    marginTop: 24,
    paddingHorizontal: 52,
    paddingVertical: 16,
    backgroundColor: '#00b4d8',
    borderRadius: 32,
  },
  playText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
  },
});
