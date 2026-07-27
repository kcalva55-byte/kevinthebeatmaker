"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

const SESSION_KEY = "ktb-intro-seen";

export default function IntroLoader() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canShowAnimation = window.matchMedia(
      "(min-width: 769px) and (pointer: fine) and (hover: hover)",
    ).matches;

    let wasAlreadyShown = false;

    try {
      wasAlreadyShown =
        window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      wasAlreadyShown = false;
    }

    if (
      shouldReduceMotion ||
      !canShowAnimation ||
      wasAlreadyShown
    ) {
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // La página continúa aunque sessionStorage no esté disponible.
    }

    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.35,
              ease: "easeOut",
            },
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#030712]"
        >
          <div
            aria-hidden="true"
            className="absolute h-72 w-72 rounded-full bg-blue-600/20 blur-[90px]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.025]"
          >
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.82,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-28 w-28 overflow-hidden rounded-[1.8rem] border border-blue-400/30 bg-[#05080d] shadow-[0_0_45px_rgba(37,99,235,0.35)] sm:h-32 sm:w-32"
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.18,
                duration: 0.38,
              }}
            >
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.45em] text-blue-300">
                Kevin The Beatmaker
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                KTB Studio
              </h1>
            </motion.div>

            <div className="mt-8 w-52 sm:w-64">
              <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.28,
                    duration: 0.9,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                  className="h-full w-full origin-left bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
