"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export default function TiltCard({
  children,
  className,
  intensity = 3,
}: TiltCardProps) {
  const boundsRef = useRef<DOMRect | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 130,
    damping: 24,
    mass: 0.45,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 130,
    damping: 24,
    mass: 0.45,
  });

  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion
      ? [0, 0]
      : [-intensity, intensity],
  );

  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion
      ? [0, 0]
      : [intensity, -intensity],
  );

  const glowX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [25, 75],
  );

  const glowY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [25, 75],
  );

  const glow = useMotionTemplate`
    radial-gradient(
      circle at ${glowX}% ${glowY}%,
      rgba(59, 130, 246, 0.16),
      transparent 38%
    )
  `;

  const handlePointerEnter = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType === "touch" ||
      prefersReducedMotion
    ) {
      return;
    }

    boundsRef.current =
      event.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType === "touch" ||
      prefersReducedMotion
    ) {
      return;
    }

    const bounds = boundsRef.current;

    if (!bounds) {
      return;
    }

    const x =
      (event.clientX - bounds.left) / bounds.width - 0.5;

    const y =
      (event.clientY - bounds.top) / bounds.height - 0.5;

    mouseX.set(Math.max(-0.5, Math.min(0.5, x)));
    mouseY.set(Math.max(-0.5, Math.min(0.5, y)));
  };

  const resetPosition = () => {
    boundsRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.008,
            }
      }
      transition={{
        scale: {
          duration: 0.18,
          ease: "easeOut",
        },
      }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div
        aria-hidden="true"
        style={{
          backgroundImage: glow,
          willChange: "background-image",
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
      />

      <div className="relative">{children}</div>
    </motion.div>
  );
}