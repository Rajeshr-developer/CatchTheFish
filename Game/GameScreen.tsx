import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Image, ImageBackground, StyleSheet } from 'react-native';
import { HUD } from './HUD';
import { EatingCanvas } from './EatingCanvas';
import {
  LEVELS,
  VILLAIN_WIDTHS,
  VILLAIN_ASPECT,
  HERO_BASE_WIDTH,
  HERO_ASPECT,
  HERO_GROWTH,
  EATS_PER_LEVEL,
} from './levelConfig';
import { VillainState, EatingAnimState } from './gameTypes';
import { startBgMusic, stopBgMusic, playEatSound, playLevelComplete, playGameOver } from './audio';

const VILLAIN_IMAGES = [
  require('../assets/Villan Fish/Vector Smart Object.png'),
  require('../assets/Villan Fish/Vector Smart Object-1.png'),
  require('../assets/Villan Fish/Vector Smart Object-2.png'),
  require('../assets/Villan Fish/Vector Smart Object-3.png'),
  require('../assets/Villan Fish/Vector Smart Object-4.png'),
  require('../assets/Villan Fish/Vector Smart Object-5.png'),
];

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
  selectedHero: number;
  level: number;
  score: number;
  gameWidth: number;
  gameHeight: number;
  onLevelComplete: (score: number) => void;
  onGameOver: (score: number) => void;
}

export function GameScreen({ selectedHero, level, score: initialScore, gameWidth, gameHeight, onLevelComplete, onGameOver }: Props) {
  // Screen dimensions — initialised from props immediately so first frame is correct
  const screenRef = useRef({ w: gameWidth, h: gameHeight });

  // Hero — positions tracked in refs for game-loop perf, mirrored to state for rendering
  const heroPosRef = useRef({ x: gameWidth / 2, y: gameHeight / 2 });
  const heroTargetRef = useRef({ x: gameWidth / 2, y: gameHeight / 2 });
  const heroSizeRef = useRef(HERO_BASE_WIDTH);
  const heroFacingRef = useRef(true); // true = right

  // Game progress
  const fishEatenRef = useRef(0);
  const scoreRef = useRef(initialScore);

  // Game loop bookkeeping
  const gameActiveRef = useRef(true);
  const villainsRef = useRef<VillainState[]>([]);
  const nextIdRef = useRef(0);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const animFrameRef = useRef<number>();
  const nextAnimIdRef = useRef(0);

  // Render state (updated inside the loop)
  const [heroPos, setHeroPos] = useState({ x: gameWidth / 2, y: gameHeight / 2 });
  const [heroSize, setHeroSize] = useState(HERO_BASE_WIDTH);
  const [heroFacing, setHeroFacing] = useState(true);
  const [villains, setVillains] = useState<VillainState[]>([]);
  const [fishEaten, setFishEaten] = useState(0);
  const [displayScore, setDisplayScore] = useState(initialScore);
  const [eatingAnims, setEatingAnims] = useState<EatingAnimState[]>([]);

  const levelConfig = LEVELS[Math.min(level - 1, LEVELS.length - 1)];

  // ─── game loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Reset everything when level changes
    gameActiveRef.current = true;
    villainsRef.current = [];
    fishEatenRef.current = 0;
    heroSizeRef.current = HERO_BASE_WIDTH;
    scoreRef.current = initialScore;
    lastTimeRef.current = 0;
    spawnTimerRef.current = 0;
    heroFacingRef.current = true;
    nextIdRef.current = 0;

    screenRef.current = { w: gameWidth, h: gameHeight };
    heroPosRef.current = { x: gameWidth / 2, y: gameHeight / 2 };
    heroTargetRef.current = { x: gameWidth / 2, y: gameHeight / 2 };

    setHeroPos({ x: gameWidth / 2, y: gameHeight / 2 });
    setHeroSize(HERO_BASE_WIDTH);
    setHeroFacing(true);
    setFishEaten(0);
    setDisplayScore(initialScore);
    setVillains([]);
    setEatingAnims([]);

    startBgMusic();

    // Spawn the first villain immediately
    spawnOne();

    function spawnOne() {
      const cfg = levelConfig;
      const { w: sw, h: sh } = screenRef.current;
      const type = cfg.villainTypes[Math.floor(Math.random() * cfg.villainTypes.length)];
      const goRight = Math.random() > 0.5;
      const margin = 80;
      const newVillain: VillainState = {
        id: nextIdRef.current++,
        x: goRight ? -120 : sw + 120,
        y: margin + Math.random() * (sh - margin * 2),
        imageIndex: type.imageIndex,
        size: type.size,
        speed: type.speed,
        facingRight: goRight,
        width: VILLAIN_WIDTHS[type.size],
      };
      villainsRef.current = [...villainsRef.current, newVillain];
    }

    function loop(timestamp: number) {
      if (!gameActiveRef.current) return;

      const dt = lastTimeRef.current
        ? Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
        : 0.016;
      lastTimeRef.current = timestamp;

      const cfg = levelConfig;
      const { w: sw } = screenRef.current;

      // ── Spawn ────────────────────────────────────────────────────────────
      spawnTimerRef.current += dt * 1000;
      if (
        spawnTimerRef.current >= cfg.spawnIntervalMs &&
        villainsRef.current.length < cfg.villainsOnScreen
      ) {
        spawnTimerRef.current = 0;
        spawnOne();
      }

      // ── Hero lerp ────────────────────────────────────────────────────────
      const lerp = 0.13;
      const hx = heroPosRef.current.x + (heroTargetRef.current.x - heroPosRef.current.x) * lerp;
      const hy = heroPosRef.current.y + (heroTargetRef.current.y - heroPosRef.current.y) * lerp;
      heroPosRef.current = { x: hx, y: hy };

      // ── Move villains ────────────────────────────────────────────────────
      let updated = villainsRef.current.map(v => ({
        ...v,
        x: v.facingRight ? v.x + v.speed * dt : v.x - v.speed * dt,
      }));
      updated = updated.filter(v => (v.facingRight ? v.x < sw + 160 : v.x > -160));

      // ── Collision ────────────────────────────────────────────────────────
      const heroR = heroSizeRef.current * 0.38;
      const { x: hpx, y: hpy } = heroPosRef.current;
      const toEat: number[] = [];
      let died = false;

      for (const v of updated) {
        const vR = v.width * 0.38;
        const dx = hpx - v.x;
        const dy = hpy - v.y;
        if (dx * dx + dy * dy < (heroR + vR) * (heroR + vR)) {
          if (heroSizeRef.current > v.width) {
            toEat.push(v.id);
          } else {
            died = true;
            break;
          }
        }
      }

      if (died) {
        gameActiveRef.current = false;
        stopBgMusic();
        setVillains([]);
        playGameOver();
        onGameOver(scoreRef.current);
        return;
      }

      // ── Process eats ─────────────────────────────────────────────────────
      if (toEat.length > 0) {
        const eaten = updated.filter(v => toEat.includes(v.id));
        updated = updated.filter(v => !toEat.includes(v.id));

        const newAnims: EatingAnimState[] = eaten.map(v => ({
          id: nextAnimIdRef.current++,
          x: v.x,
          y: v.y,
        }));

        playEatSound();
        eaten.forEach(() => {
          fishEatenRef.current += 1;
          scoreRef.current += 10 * level;
          heroSizeRef.current = Math.min(
            heroSizeRef.current + HERO_GROWTH,
            HERO_BASE_WIDTH + HERO_GROWTH * EATS_PER_LEVEL,
          );
        });

        setFishEaten(fishEatenRef.current);
        setDisplayScore(scoreRef.current);
        setHeroSize(heroSizeRef.current);
        if (newAnims.length) setEatingAnims(prev => [...prev, ...newAnims]);

        if (fishEatenRef.current >= EATS_PER_LEVEL) {
          gameActiveRef.current = false;
          stopBgMusic();
          villainsRef.current = [];
          playLevelComplete();
          onLevelComplete(scoreRef.current);
          return;
        }
      }

      villainsRef.current = updated;
      setVillains([...updated]);
      setHeroPos({ ...heroPosRef.current });

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      gameActiveRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopBgMusic();
    };
  }, [level]); // re-init when level changes

  // ─── Input ────────────────────────────────────────────────────────────────
  const handleMove = useCallback((e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const prevX = heroTargetRef.current.x;
    heroTargetRef.current = { x: locationX, y: locationY };
    const diff = locationX - prevX;
    if (Math.abs(diff) > 4) {
      const facing = diff > 0;
      heroFacingRef.current = facing;
      setHeroFacing(facing);
    }
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  const heroW = heroSize;
  const heroH = heroW * HERO_ASPECT;

  return (
    <View
      style={styles.root}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        screenRef.current = { w: width, h: height };
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderMove={handleMove}
    >
      <ImageBackground
        source={require('../assets/Bg/Bg.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* HUD */}
        <HUD level={level} score={displayScore} fishEaten={fishEaten} />

        {/* Villain fish */}
        {villains.map(v => {
          const vw = v.width;
          const vh = vw * VILLAIN_ASPECT;
          return (
            <Image
              key={v.id}
              source={VILLAIN_IMAGES[v.imageIndex]}
              style={[
                styles.entity,
                {
                  left: v.x - vw / 2,
                  top: v.y - vh / 2,
                  width: vw,
                  height: vh,
                  // images face left by default → flip when swimming right
                  transform: [{ scaleX: v.facingRight ? -1 : 1 }],
                },
              ]}
              resizeMode="contain"
            />
          );
        })}

        {/* Hero fish */}
        <Image
          source={HERO_IMAGES[selectedHero]}
          style={[
            styles.entity,
            {
              left: heroPos.x - heroW / 2,
              top: heroPos.y - heroH / 2,
              width: heroW,
              height: heroH,
              zIndex: 10,
              transform: [{ scaleX: heroFacing ? 1 : -1 }],
            },
          ]}
          resizeMode="contain"
        />

        {/* Eating animations */}
        {eatingAnims.map(anim => (
          <EatingCanvas
            key={anim.id}
            x={anim.x}
            y={anim.y}
            onFinish={() => setEatingAnims(prev => prev.filter(a => a.id !== anim.id))}
          />
        ))}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  entity: { position: 'absolute' },
});
