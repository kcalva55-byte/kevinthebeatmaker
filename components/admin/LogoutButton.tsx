"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { createClient } from "../../lib/supabase/client";

interface LogoutButtonProps {
  collapsed?: boolean;
}

export default function LogoutButton({
  collapsed = false,
}: LogoutButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión.";

      setErrorMessage(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        title={collapsed ? "Cerrar sesión" : undefined}
        className={[
          "flex w-full items-center rounded-xl border border-white/10",
          "bg-white/[0.03] text-sm font-medium text-white/65",
          "transition hover:border-red-400/25 hover:bg-red-500/10",
          "hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60",
          collapsed
            ? "justify-center px-3 py-3"
            : "gap-3 px-4 py-3",
        ].join(" ")}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5 shrink-0" />
        )}

        {!collapsed ? (
          <span>{isLoading ? "Cerrando..." : "Cerrar sesión"}</span>
        ) : null}
      </button>

      {errorMessage && !collapsed ? (
        <p className="mt-2 text-xs leading-5 text-red-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}