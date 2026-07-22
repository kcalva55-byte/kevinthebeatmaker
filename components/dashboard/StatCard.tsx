import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/25">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/15 blur-[70px] transition group-hover:bg-blue-500/25"
      />

      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-slate-400">{title}</p>

          <p className="mt-4 text-4xl font-black">{value}</p>

          <p className="mt-3 text-sm text-slate-500">{detail}</p>
        </div>

        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-400">
          <Icon size={25} />
        </div>
      </div>
    </article>
  );
}