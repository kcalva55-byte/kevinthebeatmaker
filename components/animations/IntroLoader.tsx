"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function IntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.75,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#030712]"
        >
          <motion.div
            aria-hidden="true"
            animate={{
              scale: [0.85, 1.15, 0.9],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-80 w-80 rounded-full bg-blue-600/30 blur-[110px]"
          />

          <motion.div
            aria-hidden="true"
            animate={{
              x: [-50, 50, -50],
              y: [20, -20, 20],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-52 w-52 rounded-full bg-cyan-400/15 blur-[100px]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.035]"
          >
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:44px_44px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.55,
                rotate: -8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-28 w-28 overflow-hidden rounded-[1.8rem] border border-blue-400/30 bg-[#05080d] shadow-[0_0_65px_rgba(37,99,235,0.45)] sm:h-32 sm:w-32"
            >
              <Image
                src="/images/logo-k.jpg"
                alt="Logo de KTB Studio"
                fill
                priority
                sizes="128px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.42,
                duration: 0.65,
              }}
            >
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.45em] text-blue-300">
                Kevin The Beatmaker
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                KTB Studio
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Música · Producción · Experiencia
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 w-52 sm:w-64"
            >
              <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{
                    delay: 0.7,
                    duration: 1.6,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                  className="h-full w-full bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.8)]"
                />
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Iniciando plataforma
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 2,
              duration: 0.55,
              ease: "easeInOut",
            }}
            className="absolute inset-x-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}