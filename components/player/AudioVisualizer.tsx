"use client";

import { useEffect, useRef } from "react";

type AudioVisualizerProps = {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  color: string;
  className?: string;
};

export default function AudioVisualizer({
  analyser,
  isPlaying,
  color,
  className = "",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    let animationFrame = 0;

    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const bounds = canvas.getBoundingClientRect();

      canvas.width = Math.max(1, Math.floor(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(bounds.height * pixelRatio));

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    const drawIdleBars = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const barCount = 40;
      const gap = 3;
      const barWidth = Math.max(2, (width - gap * (barCount - 1)) / barCount);

      context.clearRect(0, 0, width, height);

      for (let index = 0; index < barCount; index += 1) {
        const wave = Math.sin(index * 0.55) * 0.5 + 0.5;
        const barHeight = 4 + wave * 9;
        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        context.fillStyle = `${color}55`;
        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        context.fill();
      }
    };

    if (!analyser || !isPlaying) {
      drawIdleBars();

      return () => {
        resizeObserver.disconnect();
      };
    }

    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.82;

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      analyser.getByteFrequencyData(frequencyData);

      context.clearRect(0, 0, width, height);

      const barCount = Math.min(48, frequencyData.length);
      const gap = 3;
      const barWidth = Math.max(2, (width - gap * (barCount - 1)) / barCount);

      for (let index = 0; index < barCount; index += 1) {
        const sourceIndex = Math.floor(
          (index / barCount) * frequencyData.length * 0.72,
        );

        const normalizedValue = frequencyData[sourceIndex] / 255;
        const minimumHeight = 4;
        const barHeight = Math.max(
          minimumHeight,
          normalizedValue * height * 0.9,
        );

        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const gradient = context.createLinearGradient(0, y + barHeight, 0, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.55, color);
        gradient.addColorStop(1, "#a5f3fc");

        context.fillStyle = gradient;
        context.shadowColor = color;
        context.shadowBlur = normalizedValue > 0.5 ? 12 : 4;

        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        context.fill();
      }

      context.shadowBlur = 0;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [analyser, color, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-16 w-full ${className}`}
    />
  );
}