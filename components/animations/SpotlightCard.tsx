"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export default function SpotlightCard({
  children,
  className = "",
  intensity = 4,
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, {
    stiffness: 180,
    damping: 24,
    mass: 0.45,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 180,
    damping: 24,
    mass: 0.45,
  });

  const rotateY = useTransform(
    smoothX,
    [0, 1],
    [-intensity, intensity],
  );

  const rotateX = useTransform(
    smoothY,
    [0, 1],
    [intensity, -intensity],
  );

  const lightX = useTransform(smoothX, [0, 1], [0, 100]);
  const lightY = useTransform(smoothY, [0, 1], [0, 100]);

  const spotlight = useMotionTemplate`
    radial-gradient(
      420px circle at ${lightX}% ${lightY}%,
      color-mix(in srgb, var(--mood-primary) 26%, transparent),
      transparent 46%
    )
  `;

  const reflection = useMotionTemplate`
    linear-gradient(
      115deg,
      transparent 20%,
      color-mix(in srgb, white 14%, transparent) ${lightX}%,
      transparent 72%
    )
  `;

  const handleMouseMove = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    mouseX.set((event.clientX - bounds.left) / bounds.width);
    mouseY.set((event.clientY - bounds.top) / bounds.height);
  };

  const reset = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.012 }}
      transition={{ scale: { duration: 0.25 } }}
      className={`group relative ${className}`}
    >
      <motion.div
        aria-hidden="true"
        style={{ backgroundImage: spotlight }}
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <motion.div
        aria-hidden="true"
        style={{ backgroundImage: reflection }}
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}