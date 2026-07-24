"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import FAQAccordion, {
  type FAQItem,
} from "./FAQAccordion";
import HelpSearch from "./HelpSearch";

interface Props {
  faqs: FAQItem[];
}

export default function PublicHelpCenter({
  faqs,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return faqs;
    }

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(value) ||
        faq.answer.toLowerCase().includes(value),
    );
  }, [faqs, search]);

  return (
    <div>
      <HelpSearch
        value={search}
        onChange={setSearch}
      />

      <div className="mx-auto mt-12 max-w-4xl space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <SearchX className="h-6 w-6 text-white/30" />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-white">
              No encontramos resultados
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
              Intenta buscar usando otras palabras o revisa las
              preguntas disponibles.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/15"
            >
              Ver todas las preguntas
            </button>
          </div>
        ) : (
          filtered.map((faq) => (
            <FAQAccordion
              key={faq.id}
              item={faq}
            />
          ))
        )}
      </div>
    </div>
  );
}