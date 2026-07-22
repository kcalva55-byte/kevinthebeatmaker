"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <ChevronDown
        size={36}
        className="text-blue-400"
      />
    </motion.div>
  );
}