import Image from "next/image";
import {
  AudioWaveform,
  Disc3,
  Mic2,
  MoveUpRight,
  Music4,
} from "lucide-react";

import Reveal from "../animations/Reveal";
import SpotlightCard from "../animations/SpotlightCard";
import Stagger, { StaggerItem } from "../animations/Stagger";
import SectionTitle from "../ui/SectionTitle";

const projects = [
  {
    number: "01",
    title: "Producción Musical",
    category: "Creación y dirección",
    description:
      "Instrumentales creados desde cero, arreglos y decisiones creativas orientadas a construir una identidad sonora propia.",
    image: "/images/portfolio/produccion.webp",
    icon: Music4,
    tags: ["Beatmaking", "Arreglos", "Dirección"],
  },
  {
    number: "02",
    title: "Grabación de Voces",
    category: "Interpretación y edición",
    description:
      "Sesiones enfocadas en capturar interpretaciones limpias, con dirección vocal, comping y edición detallada.",
    image: "/images/portfolio/grabacion.webp",
    icon: Mic2,
    tags: ["Grabación", "Comping", "Afinación"],
  },
  {
    number: "03",
    title: "Mezcla",
    category: "Balance y profundidad",
    description:
      "Procesamiento, espacio, claridad y potencia para que cada elemento tenga su lugar dentro de la canción.",
    image: "/images/portfolio/mezcla.webp",
    icon: AudioWaveform,
    tags: ["Balance", "Voces", "Espacio"],
  },
  {
    number: "04",
    title: "Mastering",
    category: "Entrega final",
    description:
      "Preparación final para plataformas digitales, control tonal, volumen competitivo y consistencia.",
    image: "/images/portfolio/mastering.webp",
    icon: Disc3,
    tags: ["Loudness", "Tonalidad", "Entrega"],
  },
];

export default function Portfolio() {
  return (
    <section
      id="portafolio"
      className="relative overflow-hidden border-t border-white/5 py-28 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[580px] w-[580px] -translate-x-1/2 rounded-full blur-[200px]"
        style={{
          backgroundColor: "var(--mood-primary)",
          opacity: "0.07",
        }}
      />

      <div className="container-custom relative z-10">
        <Reveal>
          <SectionTitle
            subtitle="Portafolio"
            title="El proceso detrás del sonido"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto -mt-8 mb-16 max-w-2xl text-center text-base leading-8 text-slate-400">
            Una muestra visual de las distintas etapas que forman parte de cada
            producción, desde la idea inicial hasta el máster final.
          </p>
        </Reveal>

        <Stagger
          className="grid gap-7 lg:grid-cols-2"
          staggerDelay={0.14}
        >
          {projects.map((project) => {
            const Icon = project.icon;

            return (
              <StaggerItem key={project.title}>
                <SpotlightCard
                  intensity={3.5}
                  className="h-full rounded-[2.2rem]"
                >
                  <article className="relative h-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#06101f]/80 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-xl">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition duration-[900ms] ease-out group-hover:scale-[1.07]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/20 to-transparent" />

                      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/15 via-transparent to-cyan-950/10" />

                      <div
                        className="absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-700 group-hover:opacity-25"
                        style={{
                          background:
                            "radial-gradient(circle at 70% 20%, var(--mood-primary), transparent 42%)",
                        }}
                      />

                      <div className="absolute left-6 top-6 flex items-center gap-3">
                        <div
                          className="flex h-13 w-13 items-center justify-center rounded-2xl border bg-black/30 backdrop-blur-xl"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--mood-primary) 40%, transparent)",
                            color: "var(--mood-secondary)",
                          }}
                        >
                          <Icon size={25} strokeWidth={1.8} />
                        </div>
                      </div>

                      <span className="absolute right-6 top-6 text-sm font-bold tracking-[0.3em] text-white/45">
                        {project.number}
                      </span>
                    </div>

                    <div className="relative p-7 sm:p-9">
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.28em]"
                        style={{ color: "var(--mood-secondary)" }}
                      >
                        {project.category}
                      </p>

                      <h3 className="mt-4 text-3xl font-black sm:text-4xl">
                        {project.title}
                      </h3>

                      <p className="mt-5 leading-7 text-slate-400">
                        {project.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href="#contacto"
                        className="mt-8 inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:gap-3"
                      >
                        Trabajar este servicio

                        <MoveUpRight
                          size={18}
                          style={{ color: "var(--mood-primary)" }}
                        />
                      </a>

                      <div className="mt-7 h-px overflow-hidden bg-white/10">
                        <div
                          className="h-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                          style={{
                            background:
                              "linear-gradient(90deg, var(--mood-primary), var(--mood-secondary), transparent)",
                          }}
                        />
                      </div>
                    </div>
                  </article>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}