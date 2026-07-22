import type { Metadata } from "next";

import HelpManager from "../../../components/admin/help/HelpManager";

export const metadata: Metadata = {
  title: "Centro de Ayuda",
};

export default function AdminHelpPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-300">
          Contenido
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Centro de Ayuda
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
          Administra las preguntas y respuestas que verán tus
          clientes en la página pública de ayuda.
        </p>
      </header>

      <HelpManager />
    </div>
  );
}