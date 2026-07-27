"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

export default function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();
  const [lightweightMode, setLightweightMode] =
    useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)",
    );

    const updateMode = () => {
      setLightweightMode(
        mediaQuery.matches ||
          Boolean(shouldReduceMotion),
      );
    };

    updateMode();

    mediaQuery.addEventListener(
      "change",
      updateMode,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMode,
      );
    };
  }, [shouldReduceMotion]);

  if (lightweightMode) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[#030712]"
        style={{
          background: `
            radial-gradient(
              circle at 12% 8%,
              color-mix(
                in srgb,
                var(--mood-primary) 16%,
                transparent
              ) 0%,
              transparent 38%
            ),
            radial-gradient(
              circle at 92% 42%,
              color-mix(
                in srgb,
                var(--mood-secondary) 10%,
                transparent
              ) 0%,
              transparent 34%
            ),
            #030712
          `,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030712]"
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.48, 0.3],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-[125px] will-change-transform"
        style={{
          backgroundColor: "var(--mood-primary)",
        }}
      />

      <motion.div
        animate={{
          x: [-22, 24, -22],
          y: [14, -18, 14],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-32 top-1/3 h-[440px] w-[440px] rounded-full blur-[135px] will-change-transform"
        style={{
          backgroundColor:
            "var(--mood-secondary)",
          opacity:
            "calc(var(--mood-intensity) * 0.3)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,.38)_58%,#030712_100%)]" />
    </div>
  );
}
