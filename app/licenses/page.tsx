import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileCheck2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";
import LicenseCard, {
  type PublicLicense,
} from "../../components/legal/LicenseCard";
import LicenseComparison from "../../components/legal/LicenseComparison";

export const metadata: Metadata = {
  title: "Licencias de beats",
  description:
    "Compara las licencias Básica, Premium y Exclusiva de Kevin The Beatmaker y elige la opción adecuada para tu proyecto musical.",
};

export const revalidate = 60;

interface SiteSettings {
  studio_name: string | null;
  currency: string | null;
  support_email: string | null;
  license_footer_text: string | null;
}

async function getLicenses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beat_licenses")
    .select(
      `
        id,
        name,
        description,
        price,
        audio_format,
        distribution_limit,
        streams_limit,
        music_video_allowed,
        radio_allowed,
        paid_performances_allowed,
        exclusive
      `,
    )
    .order("price", { ascending: true });

  if (error) {
    console.error("Error loading licenses:", error.message);
    return [];
  }

  return (data ?? []) as PublicLicense[];
}

async function getSiteSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      `
        studio_name,
        currency,
        support_email,
        license_footer_text
      `,
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading site settings:",
      error.message,
    );

    return null;
  }

  return data as SiteSettings | null;
}

export default async function LicensesPage() {
  const [licenses, settings] = await Promise.all([
    getLicenses(),
    getSiteSettings(),
  ]);

  const currency = settings?.currency || "USD";
  const studioName =
    settings?.studio_name || "KTB Studio";

  const premiumIndex = licenses.findIndex((license) =>
    license.name.toLowerCase().includes("premium"),
  );

  return (
    <main className="min-h-screen bg-[#05070c] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <section className="pb-14 pt-16 text-center sm:pb-20 sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Licencias oficiales de {studioName}
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Elige la licencia correcta para tu proyecto
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
            Compara los permisos, formatos y límites de cada
            licencia. Todas las compras incluyen entrega digital
            y un documento de licencia.
          </p>
        </section>

        {licenses.length > 0 ? (
          <>
            <section className="grid gap-6 lg:grid-cols-3">
              {licenses.map((license, index) => (
                <LicenseCard
                  key={license.id}
                  license={license}
                  currency={currency}
                  featured={
                    premiumIndex >= 0
                      ? index === premiumIndex
                      : index === 1
                  }
                />
              ))}
            </section>

            <LicenseComparison licenses={licenses} />
          </>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <FileCheck2 className="mx-auto h-10 w-10 text-white/25" />

            <h2 className="mt-5 text-xl font-semibold">
              Licencias no disponibles
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
              En este momento no hay licencias publicadas.
              Intenta nuevamente más tarde.
            </p>
          </section>
        )}

        <section className="mt-24">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
              Después de comprar
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Recibe todo lo necesario
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <Download className="h-6 w-6 text-blue-300" />

              <h3 className="mt-5 font-semibold">
                Descarga de archivos
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Obtendrás los archivos de audio incluidos en la
                licencia adquirida.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <FileCheck2 className="h-6 w-6 text-blue-300" />

              <h3 className="mt-5 font-semibold">
                Licencia en PDF
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Recibirás un documento que confirma tus permisos
                de uso y los detalles de la compra.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <Mail className="h-6 w-6 text-blue-300" />

              <h3 className="mt-5 font-semibold">
                Entrega por correo
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                El enlace de descarga y la información de la
                licencia se enviarán al correo del comprador.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/15 to-white/[0.03] p-7 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
              Información importante
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Antes de realizar tu compra
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/60">
              {settings?.license_footer_text ||
                "La compra de una licencia no exclusiva no transfiere la propiedad del beat. La licencia exclusiva otorga los derechos definidos en el contrato correspondiente. Revisa cuidadosamente las condiciones antes de completar tu compra."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/terms"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.08]"
              >
                Términos y condiciones
              </Link>

              <Link
                href="/privacy"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.08]"
              >
                Política de privacidad
              </Link>

              {settings?.support_email && (
                <a
                  href={`mailto:${settings.support_email}`}
                  className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/15"
                >
                  Contactar soporte
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}