import React, { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';

const SpriteSheet = forwardRef(function SpriteSheet(props, ref) {
  const { source, columns, rows, animations = {}, imageStyle, style } = props;
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const animStateRef = useRef({
    frameIndex: 0,
    frames: [],
    intervalId: null,
  });

  const getImageSrc = (src) => {
    if (typeof src === 'string') return src;
    if (src && typeof src === 'object') {
      if (src.uri) return src.uri;
      if (src.default) return src.default;
    }
    return String(src);
  };

  const drawFrame = useCallback(
    (frameIdx) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;

      const frameW = img.width / columns;
      const frameH = img.height / rows;

      if (canvas.width !== frameW) canvas.width = frameW;
      if (canvas.height !== frameH) canvas.height = frameH;

      const col = frameIdx % columns;
      const row = Math.floor(frameIdx / columns);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, col * frameW, row * frameH, frameW, frameH, 0, 0, frameW, frameH);
    },
    [columns, rows]
  );

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const firstAnim = Object.values(animations)[0];
      drawFrame(firstAnim ? firstAnim[0] : 0);
    };
    img.src = getImageSrc(source);

    return () => {
      const { intervalId } = animStateRef.current;
      if (intervalId) clearInterval(intervalId);
    };
  }, [source]);

  useImperativeHandle(ref, () => ({
    play: ({ type, fps = 16, loop = true, resetAfterFinish = false, onFinish }) => {
      const state = animStateRef.current;
      if (state.intervalId) clearInterval(state.intervalId);

      const frames = animations[type] || [];
      state.frames = frames;
      state.frameIndex = 0;

      if (frames.length === 0) return;

      drawFrame(frames[0]);
      state.frameIndex = 1;

      state.intervalId = setInterval(() => {
        if (state.frameIndex >= frames.length) {
          if (loop) {
            state.frameIndex = 0;
          } else {
            clearInterval(state.intervalId);
            state.intervalId = null;
            if (resetAfterFinish) drawFrame(frames[0]);
            if (onFinish) onFinish();
            return;
          }
        }
        drawFrame(frames[state.frameIndex]);
        state.frameIndex++;
      }, 1000 / fps);
    },
    stop: () => {
      const state = animStateRef.current;
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', ...(imageStyle || {}), ...(style || {}) }}
    />
  );
});

export default SpriteSheet;
