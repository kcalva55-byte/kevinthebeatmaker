"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 32,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const initialPosition = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              ...initialPosition[direction],
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once,
        amount: 0.12,
        margin: "0px 0px -8% 0px",
      }}
      transition={{
        duration: shouldReduceMotion
          ? 0
          : 0.48,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "mobile-reveal",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </motion.div>
  );
}
