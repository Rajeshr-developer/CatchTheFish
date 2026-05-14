import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

// Sprite sheet: 2048x2048, ~6 frames per row, each frame ~337x158
const FRAME_W = 337;
const FRAME_H = 158;
const COLS = 6;
const TOTAL_FRAMES = 50;
const FPS = 22;

const SPRITE_SRC = require('../assets/eating-anim.png');

interface Props {
  x: number;
  y: number;
  onFinish: () => void;
}

export function EatingCanvas({ x, y, onFinish }: Props) {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const img = new (window as any).Image();

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = FRAME_W;
      canvas.height = FRAME_H;
      const ctx = canvas.getContext('2d');
      let frame = 0;

      intervalId = setInterval(() => {
        if (frame >= TOTAL_FRAMES) {
          clearInterval(intervalId!);
          onFinish();
          return;
        }
        ctx.clearRect(0, 0, FRAME_W, FRAME_H);
        const col = frame % COLS;
        const row = Math.floor(frame / COLS);
        ctx.drawImage(img, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
        frame++;
      }, 1000 / FPS);
    };

    img.src = SPRITE_SRC;

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const displayW = 110;
  const displayH = Math.round(displayW * (FRAME_H / FRAME_W));

  return (
    <View
      style={{
        position: 'absolute',
        left: x - displayW / 2,
        top: y - displayH / 2,
        width: displayW,
        height: displayH,
        zIndex: 20,
      }}
      pointerEvents="none"
    >
      {React.createElement('canvas', {
        ref: canvasRef,
        style: { width: displayW, height: displayH, display: 'block' },
      })}
    </View>
  );
}
