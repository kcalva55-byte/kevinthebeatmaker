"use client";

import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const smoothX = useSpring(cursorX, {
    stiffness: 250,
    damping: 28,
    mass: 0.4,
  });

  const smoothY = useSpring(cursorY, {
    stiffness: 250,
    damping: 28,
    mass: 0.4,
  });

  useEffect(() => {
    const supportsMouse = window.matchMedia("(pointer: fine)").matches;

    setEnabled(supportsMouse);

    if (!supportsMouse) return;

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
        backgroundColor: "var(--mood-primary)",
        opacity: "calc(var(--mood-intensity) * 0.16)",
      }}
      className="pointer-events-none fixed left-0 top-0 z-[999] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[65px] transition-colors duration-700"
    />
  );
}