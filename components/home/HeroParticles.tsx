"use client";

import { motion } from "framer-motion";

const particles = [
  { left: "8%", top: "18%", size: 4, duration: 7, delay: 0 },
  { left: "17%", top: "67%", size: 3, duration: 9, delay: 1 },
  { left: "27%", top: "32%", size: 5, duration: 8, delay: 2 },
  { left: "39%", top: "78%", size: 3, duration: 10, delay: 0.5 },
  { left: "52%", top: "16%", size: 4, duration: 7.5, delay: 1.5 },
  { left: "64%", top: "70%", size: 5, duration: 9.5, delay: 2.5 },
  { left: "75%", top: "26%", size: 3, duration: 8.5, delay: 0.8 },
  { left: "86%", top: "58%", size: 4, duration: 10, delay: 1.8 },
  { left: "93%", top: "14%", size: 3, duration: 7, delay: 3 },
];

export default function HeroParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-blue-300 shadow-[0_0_16px_rgba(96,165,250,0.85)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -26, 0],
            opacity: [0.15, 0.8, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}