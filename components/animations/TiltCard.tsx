"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type {
  MouseEvent,
  ReactNode,
} from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export default function TiltCard({
  children,
  className,
  intensity = 7,
}: TiltCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 160,
    damping: 20,
    mass: 0.5,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 160,
    damping: 20,
    mass: 0.5,
  });

  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-intensity, intensity],
  );

  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    [intensity, -intensity],
  );

  const glowX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [20, 80],
  );

  const glowY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [20, 80],
  );

  const glow = useMotionTemplate`
    radial-gradient(
      circle at ${glowX}% ${glowY}%,
      rgba(59, 130, 246, 0.22),
      transparent 42%
    )
  `;

  const handleMouseMove = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    const bounds =
      event.currentTarget.getBoundingClientRect();

    mouseX.set(
      (event.clientX - bounds.left) / bounds.width - 0.5,
    );

    mouseY.set(
      (event.clientY - bounds.top) / bounds.height - 0.5,
    );
  };

  const resetPosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPosition}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.015,
      }}
      transition={{
        scale: {
          duration: 0.25,
        },
      }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div
        aria-hidden="true"
        style={{
          backgroundImage: glow,
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
      />

      <div className="relative">{children}</div>
    </motion.div>
  );
}