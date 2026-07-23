"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();

  const previousScroll = useRef(0);

  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const section = (id: string) =>
    pathname === "/" ? `#${id}` : `/#${id}`;

  const links = [
    { label: "Inicio", href: section("inicio") },
    { label: "Beats", href: section("beats") },
    { label: "Servicios", href: section("servicios") },
    { label: "Producciones", href: section("producciones") },
    { label: "Contacto", href: section("contacto") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollingDown = currentScroll > previousScroll.current;

      setScrolled(currentScroll > 24);

      if (currentScroll < 100) {
        setVisible(true);
      } else if (scrollingDown && !menuOpen) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      previousScroll.current = currentScroll;
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Mantén TODO el resto del componente exactamente igual */}

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: visible ? 0 : -110,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "px-3 pt-3" : "px-0 pt-0"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "container-custom h-16 rounded-2xl border border-white/10 bg-[#030712]/82 px-4 shadow-[0_18px_55px_rgba(0,0,0,.35)] backdrop-blur-2xl"
              : "container-custom h-20"
          }`}
        >
          <Link
            href={section("inicio")}
            aria-label="Kevin The Beatmaker - Inicio"
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{
                width: scrolled ? 38 : 44,
                height: scrolled ? 38 : 44,
                borderRadius: scrolled ? 11 : 13,
              }}
              className="relative overflow-hidden border border-blue-400/30 bg-[#05080d] shadow-[0_0_24px_rgba(37,99,235,.25)]"
            >
              <Image
                src="/images/logo-k.jpg"
                alt="Logo de KTB Studio"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </motion.div>

            <div className="leading-tight">
              <p
                className={`font-black text-white transition-all ${
                  scrolled ? "text-sm" : "text-base sm:text-lg"
                }`}
              >
                Kevin The Beatmaker
              </p>

              <p
                className={`font-semibold uppercase tracking-[0.24em] text-blue-400 transition-all ${
                  scrolled ? "text-[9px]" : "text-[10px] sm:text-xs"
                }`}
              >
                KTB Studio
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {link.label}

                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-cyan-300 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <Link
            href={section("contacto")}
            className={`hidden rounded-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/25 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 lg:block ${
              scrolled
                ? "px-5 py-2.5 text-xs"
                : "px-6 py-3 text-sm"
            }`}
          >
            Trabajemos juntos
          </Link>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 lg:hidden"
          >
            <Menu size={26} />
          </button>
        </div>

        {scrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="container-custom h-px origin-center bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          />
        )}
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030712]/98 backdrop-blur-2xl lg:hidden"
          >
            <motion.div
              initial={{ y: -25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -25, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center justify-between border-b border-white/10 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-blue-400/30">
                  <Image
                    src="/images/logo-k.jpg"
                    alt="Logo de KTB Studio"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Kevin The Beatmaker
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                    KTB Studio
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2"
              >
                <X size={29} />
              </button>
            </motion.div>

            <nav className="flex flex-col items-center gap-8 pt-20">
{links.map((link, index) => (
  <motion.div
    key={link.href}
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: 0.08 + index * 0.07,
    }}
  >
    <Link
      href={link.href}
      onClick={() => setMenuOpen(false)}
      className="text-3xl font-bold transition hover:text-blue-400"
    >
      {link.label}
    </Link>
  </motion.div>
))}

              <motion.div
  initial={{ opacity: 0, y: 25 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.48 }}
>
  <Link
    href={section("contacto")}
    onClick={() => setMenuOpen(false)}
    className="mt-4 inline-block rounded-full bg-blue-600 px-8 py-4 font-semibold shadow-lg shadow-blue-600/30"
  >
    Trabajemos juntos
  </Link>
</motion.div>
            </nav>

            <div className="pointer-events-none absolute bottom-[-120px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}