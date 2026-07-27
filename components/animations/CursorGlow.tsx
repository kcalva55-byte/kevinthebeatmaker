"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

export default function CursorGlow() {
  const shouldReduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const smoothX = useSpring(cursorX, {
    stiffness: 220,
    damping: 30,
    mass: 0.45,
  });

  const smoothY = useSpring(cursorY, {
    stiffness: 220,
    damping: 30,
    mass: 0.45,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (hover: hover)",
    );

    let animationFrame = 0;
    let latestX = -200;
    let latestY = -200;

    const updateEnabledState = () => {
      setEnabled(
        mediaQuery.matches && !shouldReduceMotion,
      );
    };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      latestX = event.clientX;
      latestY = event.clientY;

      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(
        () => {
          cursorX.set(latestX);
          cursorY.set(latestY);
          animationFrame = 0;
        },
      );
    };

    updateEnabledState();

    mediaQuery.addEventListener(
      "change",
      updateEnabledState,
    );

    if (mediaQuery.matches && !shouldReduceMotion) {
      window.addEventListener(
        "pointermove",
        handlePointerMove,
        { passive: true },
      );
    }

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateEnabledState,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    cursorX,
    cursorY,
    shouldReduceMotion,
  ]);

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
        backgroundColor: "var(--mood-primary)",
        opacity:
          "calc(var(--mood-intensity) * 0.13)",
      }}
      className="pointer-events-none fixed left-0 top-0 z-[999] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[58px]"
    />
  );
}
