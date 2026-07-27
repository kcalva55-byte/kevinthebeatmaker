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
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", {
      alpha: true,
    });

    if (!context) {
      return;
    }

    const isMobile = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)",
    ).matches;

    const targetFrameInterval = isMobile
      ? 1000 / 18
      : 1000 / 30;

    const barCount = isMobile ? 24 : 36;
    const gap = isMobile ? 2 : 3;

    let animationFrame = 0;
    let lastFrameTime = 0;
    let isVisible = true;

    const resizeCanvas = () => {
      const bounds =
        canvas.getBoundingClientRect();

      const logicalWidth = Math.max(
        1,
        Math.floor(bounds.width),
      );

      const logicalHeight = Math.max(
        1,
        Math.floor(bounds.height),
      );

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1 : 1.5,
      );

      canvas.width = Math.max(
        1,
        Math.floor(logicalWidth * pixelRatio),
      );

      canvas.height = Math.max(
        1,
        Math.floor(logicalHeight * pixelRatio),
      );

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      );
    };

    const drawIdleBars = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      context.clearRect(0, 0, width, height);
      context.shadowBlur = 0;
      context.fillStyle = `${color}48`;

      const barWidth = Math.max(
        2,
        (width - gap * (barCount - 1)) /
          barCount,
      );

      for (
        let index = 0;
        index < barCount;
        index += 1
      ) {
        const wave =
          Math.sin(index * 0.58) * 0.5 + 0.5;

        const barHeight = 4 + wave * 8;
        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        context.beginPath();
        context.roundRect(
          x,
          y,
          barWidth,
          barHeight,
          barWidth / 2,
        );
        context.fill();
      }
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(
      () => {
        resizeCanvas();
        drawIdleBars();
      },
    );

    resizeObserver.observe(canvas);

    const intersectionObserver =
      new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        {
          rootMargin: "120px",
          threshold: 0,
        },
      );

    intersectionObserver.observe(canvas);

    if (!analyser || !isPlaying) {
      drawIdleBars();

      return () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
      };
    }

    analyser.fftSize = isMobile ? 64 : 128;
    analyser.smoothingTimeConstant = 0.82;

    const frequencyData = new Uint8Array(
      analyser.frequencyBinCount,
    );

    const draw = (time: number) => {
      animationFrame =
        window.requestAnimationFrame(draw);

      if (
        document.hidden ||
        !isVisible ||
        time - lastFrameTime <
          targetFrameInterval
      ) {
        return;
      }

      lastFrameTime = time;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      analyser.getByteFrequencyData(
        frequencyData,
      );

      context.clearRect(0, 0, width, height);

      const barWidth = Math.max(
        2,
        (width - gap * (barCount - 1)) /
          barCount,
      );

      const gradient =
        context.createLinearGradient(
          0,
          height,
          0,
          0,
        );

      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, "#a5f3fc");

      context.fillStyle = gradient;
      context.shadowColor = color;
      context.shadowBlur = isMobile ? 0 : 5;

      for (
        let index = 0;
        index < barCount;
        index += 1
      ) {
        const sourceIndex = Math.min(
          frequencyData.length - 1,
          Math.floor(
            (index / barCount) *
              frequencyData.length *
              0.72,
          ),
        );

        const normalizedValue =
          frequencyData[sourceIndex] / 255;

        const barHeight = Math.max(
          4,
          normalizedValue * height * 0.86,
        );

        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        context.beginPath();
        context.roundRect(
          x,
          y,
          barWidth,
          barHeight,
          barWidth / 2,
        );
        context.fill();
      }

      context.shadowBlur = 0;
    };

    animationFrame =
      window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );

      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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
