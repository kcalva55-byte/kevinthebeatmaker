"use client";

import { useMemo, useState } from "react";

import FAQAccordion, {
  FAQItem,
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
    const value = search
      .trim()
      .toLowerCase();

    if (!value) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question
          .toLowerCase()
          .includes(value) ||
        faq.answer
          .toLowerCase()
          .includes(value)
    );
  }, [faqs, search]);

  return (
    <>
      <HelpSearch
        value={search}
        onChange={setSearch}
      />

      <div className="mt-12 space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
            <h3 className="text-xl font-semibold text-white">
              No encontramos resultados
            </h3>

            <p className="mt-3 text-white/50">
              Intenta utilizar otras palabras.
            </p>
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
    </>
  );
}