import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-white/10",
        "bg-white/5 backdrop-blur-xl",
        "shadow-2xl",
        "transition-all duration-300",
        "hover:border-blue-500/30",
        className
      )}
    >
      {children}
    </div>
  );
}