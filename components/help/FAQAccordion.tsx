"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  item: FAQItem;
}

export default function FAQAccordion({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/[0.03]"
      >
        <h3 className="text-lg font-semibold text-white">
          {item.question}
        </h3>

        <ChevronDown
          className={`h-5 w-5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-6 py-5 whitespace-pre-wrap leading-7 text-white/65">
            {item.answer}
          </div>
        </div>
      </div>
    </article>
  );
}