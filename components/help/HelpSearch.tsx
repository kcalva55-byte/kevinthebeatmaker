"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange(value: string): void;
}

export default function HelpSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mx-auto max-w-xl">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />

      <input
        type="search"
        placeholder="Buscar una pregunta..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-12 pr-5 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500"
      />
    </div>
  );
}