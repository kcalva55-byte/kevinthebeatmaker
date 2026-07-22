import {
  AudioLines,
  Disc3,
  Mic2,
  Music4,
  Sparkles,
} from "lucide-react";

import Stagger, {
  StaggerItem,
} from "../animations/Stagger";
import TiltCard from "../animations/TiltCard";
import Reveal from "../animations/Reveal";
import SectionTitle from "../ui/SectionTitle";

const services = [
  {
    icon: Music4,
    number: "01",
    title: "Producción Musical",
    description:
      "Creación de instrumentales y producción completa adaptada a tu identidad, estilo y visión artística.",
    features: [
      "Beat exclusivo",
      "Arreglo musical",
      "Dirección creativa",
    ],
  },
  {
    icon: AudioLines,
    number: "02",
    title: "Mezcla",
    description:
      "Balance, claridad, profundidad y potencia para conseguir un sonido moderno y competitivo.",
    features: [
      "Edición de voces",
      "Procesamiento profesional",
      "Revisiones",
    ],
  },
  {
    icon: Disc3,
    number: "03",
    title: "Mastering",
    description:
      "Preparación final de tu canción para que suene sólida y consistente en todas las plataformas.",
    features: [
      "Volumen competitivo",
      "Control tonal",
      "Entrega digital",
    ],
  },
  {
    icon: Mic2,
    number: "04",
    title: "Grabación de voces",
    description:
      "Sesiones de grabación enfocadas en obtener interpretaciones limpias, expresivas y profesionales.",
    features: [
      "Dirección vocal",
      "Comping",
      "Afinación y edición",
    ],
  },
];

export default function Services() {
  return (
    <section
      id="servicios"
      className="relative overflow-hidden border-t border-white/5 py-28 sm:py-32"
    >
      {/* Iluminación ambiental */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-1/3 h-[480px] w-[480px] rounded-full blur-[170px]"
        style={{
          backgroundColor: "var(--mood-primary)",
          opacity: "0.1",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 bottom-0 h-[480px] w-[480px] rounded-full blur-[180px]"
        style={{
          backgroundColor: "var(--mood-secondary)",
          opacity: "0.08",
        }}
      />

      <div className="container-custom relative z-10">
        <Reveal>
          <SectionTitle
            subtitle="Servicios"
            title="Todo lo que tu música necesita"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto -mt-8 mb-16 max-w-2xl text-center text-base leading-8 text-slate-400">
            Desde la primera idea hasta el archivo final, cada
            etapa está enfocada en construir un sonido con
            identidad y calidad profesional.
          </p>
        </Reveal>

        <Stagger
          className="grid gap-6 md:grid-cols-2"
          staggerDelay={0.13}
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <StaggerItem key={service.title}>
                <TiltCard
                  intensity={5}
                  className="h-full rounded-[2rem]"
                >
                  <article className="group relative h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-2xl backdrop-blur-xl transition duration-500 hover:border-white/20 sm:p-9">
                    {/* Glow interno */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-0 blur-[90px] transition-opacity duration-500 group-hover:opacity-25"
                      style={{
                        backgroundColor:
                          "var(--mood-primary)",
                      }}
                    />

                    {/* Número */}
                    <div className="relative flex items-start justify-between">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/[0.04] transition duration-500 group-hover:-translate-y-1"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--mood-primary) 35%, transparent)",
                          color: "var(--mood-primary)",
                          boxShadow:
                            "0 15px 45px color-mix(in srgb, var(--mood-glow) 16%, transparent)",
                        }}
                      >
                        <Icon size={27} strokeWidth={1.8} />
                      </div>

                      <span className="text-sm font-bold tracking-[0.25em] text-white/20">
                        {service.number}
                      </span>
                    </div>

                    <div className="relative mt-10">
                      <h3 className="text-2xl font-black sm:text-3xl">
                        {service.title}
                      </h3>

                      <p className="mt-5 max-w-xl leading-7 text-slate-400">
                        {service.description}
                      </p>

                      <div className="mt-8 space-y-3">
                        {service.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-3 text-sm text-slate-300"
                          >
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--mood-primary) 14%, transparent)",
                                color:
                                  "var(--mood-secondary)",
                              }}
                            >
                              <Sparkles size={12} />
                            </span>

                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Línea inferior */}
                    <div className="absolute inset-x-7 bottom-0 h-px overflow-hidden sm:inset-x-9">
                      <div
                        className="h-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--mood-primary), var(--mood-secondary), transparent)",
                        }}
                      />
                    </div>
                  </article>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.2}>
          <div className="mt-12 flex justify-center">
            <a
              href="#contacto"
              className="mood-border mood-shadow group inline-flex items-center gap-3 rounded-full border bg-white/[0.04] px-7 py-4 font-semibold backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition duration-300 group-hover:scale-125"
                style={{
                  backgroundColor: "var(--mood-primary)",
                  boxShadow:
                    "0 0 16px var(--mood-primary)",
                }}
              />

              Solicitar información
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}