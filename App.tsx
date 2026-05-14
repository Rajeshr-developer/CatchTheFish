import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { HeroSelect } from './Game/HeroSelect';
import { GameScreen } from './Game/GameScreen';
import { GameOver } from './Game/GameOver';
import { LevelComplete } from './Game/LevelComplete';
import { ScreenName } from './Game/gameTypes';

const ASPECT = 16 / 9;

function useGameDimensions() {
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const { w, h } = dims;
  // Largest 16:9 rect that fits inside the viewport
  const gameH = Math.min(h, w / ASPECT);
  const gameW = Math.round(gameH * ASPECT);
  return { gameW, gameH: Math.round(gameH) };
}

const App = () => {
  const [screen, setScreen] = useState<ScreenName>('heroSelect');
  const [selectedHero, setSelectedHero] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const { gameW, gameH } = useGameDimensions();

  const startGame = (heroIndex: number) => {
    setSelectedHero(heroIndex);
    setLevel(1);
    setScore(0);
    setScreen('playing');
  };

  const handleLevelComplete = (newScore: number) => {
    setScore(newScore);
    setScreen('levelComplete');
  };

  const handleGameOver = (newScore: number) => {
    setScore(newScore);
    setScreen('gameOver');
  };

  const handleNextLevel = () => {
    if (level >= 20) {
      setLevel(1);
      setScore(0);
      setScreen('heroSelect');
    } else {
      setLevel(l => l + 1);
      setScreen('playing');
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setScreen('heroSelect');
  };

  return (
    <View style={styles.shell}>
      <View style={{ width: gameW, height: gameH, overflow: 'hidden' as any }}>
        {screen === 'heroSelect' && <HeroSelect onSelect={startGame} />}
        {screen === 'playing' && (
          <GameScreen
            selectedHero={selectedHero}
            level={level}
            score={score}
            gameWidth={gameW}
            gameHeight={gameH}
            onLevelComplete={handleLevelComplete}
            onGameOver={handleGameOver}
          />
        )}
        {screen === 'levelComplete' && (
          <LevelComplete level={level} score={score} onNextLevel={handleNextLevel} />
        )}
        {screen === 'gameOver' && (
          <GameOver score={score} level={level} onRestart={handleRestart} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: '100%' as any,
    height: '100%' as any,
    backgroundColor: '#000814',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
