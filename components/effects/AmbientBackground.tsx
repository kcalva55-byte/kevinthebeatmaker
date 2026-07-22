"use client";

import { motion } from "framer-motion";

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030712]"
    >
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full blur-[170px]"
        style={{
          backgroundColor: "var(--mood-primary)",
          opacity: "var(--mood-intensity)",
        }}
      />

      <motion.div
        animate={{
          x: [-30, 35, -30],
          y: [20, -25, 20],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full blur-[180px]"
        style={{
          backgroundColor: "var(--mood-secondary)",
          opacity: "calc(var(--mood-intensity) * 0.38)",
        }}
      />

      <motion.div
        animate={{
          scale: [0.9, 1.16, 0.9],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-300px] left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full blur-[200px]"
        style={{
          backgroundColor: "var(--mood-ambient)",
          opacity: "var(--mood-intensity)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,.35)_55%,#030712_100%)]" />

      <div className="absolute inset-0 opacity-[0.025]">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
    </div>
  );
}