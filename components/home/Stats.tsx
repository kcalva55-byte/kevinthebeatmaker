"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "50+",
    label: "Beats"
  },
  {
    value: "20+",
    label: "Artistas"
  },
  {
    value: "100+",
    label: "Horas de estudio"
  }
];

export default function Stats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .5 }}
      className="grid md:grid-cols-3 gap-6 mt-20"
    >
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-blue-500/20 bg-white/5 backdrop-blur-md p-8 text-center"
        >
          <h2 className="text-4xl font-bold text-blue-400">
            {item.value}
          </h2>

          <p className="text-gray-300 mt-2">
            {item.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}