import {
  FaInstagram,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";

import Reveal from "../animations/Reveal";

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-white/10 bg-slate-950/60 py-12"
    >
      <Reveal>
        <div className="container-custom">
          <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div>
              <p className="text-2xl font-black">
                Kevin{" "}
                <span className="text-blue-500">
                  The Beatmaker
                </span>
              </p>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                KTB Studio
              </p>

              <p className="mt-4 text-sm text-slate-400">
                Producción Musical · Mezcla · Mastering · Grabación de voces
              </p>
            </div>

            <div className="flex items-center gap-5 text-2xl">
              <a
                href="#"
                aria-label="Instagram"
                className="transition duration-300 hover:-translate-y-1 hover:text-blue-400"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="transition duration-300 hover:-translate-y-1 hover:text-blue-400"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                aria-label="Spotify"
                className="transition duration-300 hover:-translate-y-1 hover:text-blue-400"
              >
                <FaSpotify />
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
            <p>© 2026 KTB Studio. Todos los derechos reservados.</p>

            <p>
              Plataforma oficial de{" "}
              <span className="text-slate-300">
                Kevin The Beatmaker
              </span>
            </p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}