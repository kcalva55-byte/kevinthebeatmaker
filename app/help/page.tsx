import type { Metadata } from "next";

import { createClient } from "../../lib/supabase/server";
import PublicHelpCenter from "../../components/help/PublicHelpCenter";

export const metadata: Metadata = {
  title: "Centro de Ayuda",
  description:
    "Encuentra respuestas a las preguntas más frecuentes sobre licencias, descargas y compras en KTB Studio.",
};

async function getFaqs() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("help_faqs")
    .select(
      `
        id,
        question,
        answer
      `
    )
    .eq("published", true)
    .order("sort_order");

  return data ?? [];
}

export default async function HelpPage() {
  const faqs = await getFaqs();

  return (
    <main className="min-h-screen bg-[#05070c] text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
            Centro de Ayuda
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight">
            ¿En qué podemos ayudarte?
          </h1>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-white/55">
            Encuentra respuestas sobre licencias,
            pagos, descargas, uso comercial y todo
            lo relacionado con tus compras en
            KTB Studio.
          </p>
        </div>

        <section className="mt-16">
          <PublicHelpCenter
            faqs={faqs}
          />
        </section>
      </div>
    </main>
  );
}