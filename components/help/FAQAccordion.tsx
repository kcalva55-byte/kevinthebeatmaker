"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
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
    <article
      className={`overflow-hidden rounded-2xl border transition duration-300 ${
        open
          ? "border-blue-400/25 bg-blue-500/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.045]"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
            open
              ? "border-blue-400/25 bg-blue-500/15 text-blue-300"
              : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
        >
          <HelpCircle className="h-5 w-5" />
        </div>

        <h3 className="flex-1 text-base font-semibold leading-6 text-white sm:text-lg">
          {item.question}
        </h3>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
            open
              ? "border-blue-400/25 bg-blue-500/15 text-blue-300"
              : "border-white/10 bg-white/[0.03] text-white/45"
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-5 pb-6 pt-5 sm:ml-20 sm:px-6">
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/60 sm:text-base">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}