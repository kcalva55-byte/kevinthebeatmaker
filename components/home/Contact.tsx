"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import Reveal from "../animations/Reveal";
import SpotlightCard from "../animations/SpotlightCard";
import SectionTitle from "../ui/SectionTitle";

const services = [
  "Producción Musical",
  "Mezcla",
  "Mastering",
  "Grabación de voces",
  "Beat personalizado",
  "Otro",
];

/*
  Reemplaza este número por tu WhatsApp real.

  Debe incluir el código de país y no debe tener:
  - símbolo +
  - espacios
  - guiones

  Ejemplo para Ecuador:
  593991234567
*/
const WHATSAPP_NUMBER = "593989854933";

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.service ||
      !formData.message.trim()
    ) {
      setError(
        "Completa tu nombre, correo, servicio y mensaje.",
      );

      return;
    }

    const whatsappMessage = [
      "Hola Kevin, quiero solicitar información.",
      "",
      `Nombre: ${formData.name}`,
      `Correo: ${formData.email}`,
      `Teléfono: ${formData.phone || "No indicado"}`,
      `Servicio: ${formData.service}`,
      "",
      "Mensaje:",
      formData.message,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage,
    )}`;

    setSubmitted(true);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section
      id="contacto"
      className="relative overflow-hidden border-t border-white/5 py-28 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-52 top-1/4 h-[500px] w-[500px] rounded-full blur-[180px]"
        style={{
          backgroundColor: "var(--mood-primary)",
          opacity: "0.1",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 bottom-0 h-[500px] w-[500px] rounded-full blur-[190px]"
        style={{
          backgroundColor: "var(--mood-secondary)",
          opacity: "0.07",
        }}
      />

      <div className="container-custom relative z-10">
        <Reveal>
          <SectionTitle
            subtitle="Contacto"
            title="Construyamos tu próximo sonido"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto -mt-8 mb-16 max-w-2xl text-center leading-8 text-slate-400">
            Cuéntame sobre tu proyecto, selecciona el servicio que
            necesitas y conversemos sobre la mejor forma de llevar
            tu música al siguiente nivel.
          </p>
        </Reveal>

        <div className="grid items-stretch gap-7 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal direction="right">
            <div className="flex h-full flex-col gap-5">
              <SpotlightCard
                intensity={3}
                className="rounded-[2rem]"
              >
                <div className="mood-border mood-shadow relative overflow-hidden rounded-[2rem] border bg-white/[0.035] p-7 backdrop-blur-xl sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Contacto directo
                  </p>

                  <h3 className="mt-4 text-3xl font-black">
                    Hablemos de tu proyecto
                  </h3>

                  <p className="mt-5 leading-7 text-slate-400">
                    Puedes escribir directamente por WhatsApp o
                    completar el formulario para enviar todos los
                    detalles de tu canción.
                  </p>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mood-background mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 font-semibold text-white transition duration-300 hover:-translate-y-1"
                  >
                    <MessageCircle size={21} />
                    Escribir por WhatsApp
                  </a>
                </div>
              </SpotlightCard>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <a
                  href="mailto:kcalva55@gmail.com"
                  className="group rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.055]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        color: "var(--mood-secondary)",
                        backgroundColor:
                          "color-mix(in srgb, var(--mood-primary) 14%, transparent)",
                      }}
                    >
                      <Mail size={23} />
                    </span>

                    <div>
                      <p className="font-bold">Correo</p>

                      <p className="mt-1 text-sm text-slate-500">
                        tu-correo@ejemplo.com
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href="#"
                  className="group rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.055]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        color: "var(--mood-secondary)",
                        backgroundColor:
                          "color-mix(in srgb, var(--mood-primary) 14%, transparent)",
                      }}
                    >
                      <FaInstagram size={23} />
                    </span>

                    <div>
                      <p className="font-bold">Instagram</p>

                      <p className="mt-1 text-sm text-slate-500">
                        @kevinthebeatmaker

                      </p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-start gap-4">
                  <CalendarDays
                    className="mt-1 shrink-0"
                    size={23}
                    style={{
                      color: "var(--mood-primary)",
                    }}
                  />

                  <div>
                    <p className="font-bold">
                      Reservas y sesiones
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Después de recibir tu solicitud coordinaremos
                      la fecha, duración y modalidad de la sesión.
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 size={16} />
                      Respuesta estimada: 24 horas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <SpotlightCard
              intensity={2.5}
              className="h-full rounded-[2rem]"
            >
              <form
                onSubmit={handleSubmit}
                className="mood-border relative h-full overflow-hidden rounded-[2rem] border bg-[#06101f]/75 p-6 shadow-2xl backdrop-blur-2xl sm:p-9"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full opacity-15 blur-[100px]"
                  style={{
                    backgroundColor: "var(--mood-primary)",
                  }}
                />

                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Solicitud de proyecto
                  </p>

                  <h3 className="mt-4 text-3xl font-black sm:text-4xl">
                    Cuéntame qué necesitas
                  </h3>

                  <div className="mt-9 grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-300">
                        Nombre *
                      </span>

                      <input
                        type="text"
                        value={formData.name}
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                        placeholder="Tu nombre"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--mood-primary)] focus:bg-white/[0.055]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-300">
                        Correo electrónico *
                      </span>

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="correo@ejemplo.com"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--mood-primary)] focus:bg-white/[0.055]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-300">
                        Teléfono
                      </span>

                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        placeholder="+593..."
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--mood-primary)] focus:bg-white/[0.055]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-300">
                        Servicio *
                      </span>

                      <select
                        value={formData.service}
                        onChange={(event) =>
                          updateField("service", event.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#091324] px-4 py-3.5 text-white outline-none transition focus:border-[var(--mood-primary)]"
                      >
                        <option value="">
                          Selecciona un servicio
                        </option>

                        {services.map((service) => (
                          <option
                            key={service}
                            value={service}
                          >
                            {service}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-6 block">
                    <span className="text-sm font-semibold text-slate-300">
                      Cuéntame sobre tu proyecto *
                    </span>

                    <textarea
                      value={formData.message}
                      onChange={(event) =>
                        updateField("message", event.target.value)
                      }
                      placeholder="Género, referencias, estado actual de la canción, fecha estimada..."
                      rows={6}
                      className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--mood-primary)] focus:bg-white/[0.055]"
                    />
                  </label>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      {error}
                    </motion.p>
                  )}

                  {submitted && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                    >
                      <CheckCircle2 size={19} />
                      Abriendo WhatsApp con tu solicitud.
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="mood-background mood-shadow mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full px-7 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    Enviar solicitud
                    <Send size={19} />
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-slate-600">
                    Al enviar, se abrirá WhatsApp con todos los
                    datos de la solicitud.
                  </p>
                </div>
              </form>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}