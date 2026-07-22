"use client";

import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { AudioWaveform, Play, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";

import BackgroundGlow from "../ui/BackgroundGlow";
import Button from "../ui/Button";
import HeroParticles from "./HeroParticles";
import HeroPlayer from "./HeroPlayer";
import HeroVideo from "./HeroVideo";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 18,
    mass: 0.5,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 18,
    mass: 0.5,
  });

  const imageX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3, -3]);

  const glowX = useTransform(smoothX, [-0.5, 0.5], [25, 75]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [25, 75]);

  const dynamicGlow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(37, 99, 235, 0.28), transparent 42%)`;

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetMouse = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const goToBeats = () => {
    document.querySelector("#beats")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const goToContact = () => {
    document.querySelector("#contacto")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-28"
    >
      <HeroVideo />
      <BackgroundGlow />
      <HeroParticles />

      <motion.div
        aria-hidden="true"
        style={{ backgroundImage: dynamicGlow }}
        className="pointer-events-none absolute inset-0"
      />

      <div className="absolute inset-0 opacity-[0.035]">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="container-custom relative z-10 grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200 backdrop-blur-md">
            <Sparkles size={15} />
            Productor musical
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[0.92] tracking-[-0.045em] sm:text-7xl xl:text-[5.7rem]">
            Kevin

            <span className="block bg-gradient-to-r from-blue-300 via-blue-500 to-cyan-300 bg-clip-text text-transparent">
              The Beatmaker
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Producción musical, mezcla, mastering y grabación de voces.
            Especializado en Reggaetón, Trap, Detroit y Afrobeat.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Button
              onClick={goToBeats}
              className="group flex items-center gap-2"
            >
              <Play
                size={18}
                fill="currentColor"
                className="transition-transform group-hover:scale-110"
              />

              Ver todos los beats
            </Button>

            <Button variant="secondary" onClick={goToContact}>
              Reservar sesión
            </Button>
          </div>

          <div className="mt-10 max-w-2xl">
            <HeroPlayer />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.95, ease: "easeOut" }}
          style={{
            x: imageX,
            y: imageY,
            rotateX,
            rotateY,
            transformPerspective: 1200,
          }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="absolute inset-10 rounded-[3rem] bg-blue-600/35 blur-[110px]" />

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] border border-white/10 bg-white/[0.05] p-3 shadow-[0_35px_100px_rgba(0,0,0,.6)] backdrop-blur-xl">
            <div className="relative h-full overflow-hidden rounded-[2.25rem] border border-blue-400/20 bg-slate-950">
              <Image
                src="/images/kevin-studio.png"
                alt="Kevin The Beatmaker trabajando en su estudio"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-blue-950/20" />

              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/15 via-transparent to-cyan-950/10" />

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <div className="flex items-center gap-3 text-blue-200">
                  <AudioWaveform size={22} />

                  <span className="text-xs uppercase tracking-[0.28em]">
                    Sonido original
                  </span>
                </div>

                <h2 className="mt-4 max-w-md text-2xl font-black leading-tight sm:text-3xl">
                  Creando música con identidad, potencia y calidad profesional.
                </h2>

                <div className="mt-6 h-px bg-gradient-to-r from-blue-500 via-cyan-400/50 to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}