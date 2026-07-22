import SettingsForm, {
  type SiteSettings,
} from "../../../components/admin/settings/SettingsForm";

import { createAdminClient } from "../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar la configuración
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
          <h1 className="text-xl font-semibold text-amber-200">
            No existe una configuración
          </h1>

          <p className="mt-2 text-sm leading-6 text-amber-200/70">
            Ejecuta primero el registro inicial de
            la tabla site_settings en Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsForm
      initialSettings={data as SiteSettings}
    />
  );
}