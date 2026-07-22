import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "cursor-pointer rounded-full px-7 py-3.5 font-semibold",
        "transition duration-300 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        variant === "primary" &&
          "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500",
        variant === "secondary" &&
          "border border-blue-400/60 bg-blue-500/5 text-blue-100 hover:bg-blue-500/15",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}