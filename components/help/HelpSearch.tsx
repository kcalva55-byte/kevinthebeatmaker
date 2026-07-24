"use client";

import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange(value: string): void;
}

export default function HelpSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mx-auto max-w-2xl">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />

      <input
        type="search"
        aria-label="Buscar en el centro de ayuda"
        placeholder="Buscar una pregunta..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-14 text-sm text-white shadow-2xl shadow-black/10 outline-none transition placeholder:text-white/30 hover:border-white/15 focus:border-blue-400/40 focus:bg-white/[0.055] focus:ring-4 focus:ring-blue-500/5 sm:text-base"
      />

      {value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition hover:bg-white/[0.08] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}