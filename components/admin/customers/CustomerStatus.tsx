import {
  Crown,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import type {
  CustomerCategory,
} from "./types";

interface CustomerStatusProps {
  category: CustomerCategory;
}

function getCategoryInformation(
  category: CustomerCategory,
) {
  switch (category) {
    case "vip":
      return {
        label: "VIP",
        icon: Crown,
        classes:
          "border-amber-400/20 bg-amber-500/10 text-amber-300",
      };

    case "frequent":
      return {
        label: "Frecuente",
        icon: Star,
        classes:
          "border-purple-400/20 bg-purple-500/10 text-purple-300",
      };

    case "active":
      return {
        label: "Activo",
        icon: Sparkles,
        classes:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      };

    case "new":
    default:
      return {
        label: "Nuevo",
        icon: UserRound,
        classes:
          "border-blue-400/20 bg-blue-500/10 text-blue-300",
      };
  }
}

export default function CustomerStatus({
  category,
}: CustomerStatusProps) {
  const information =
    getCategoryInformation(category);

  const Icon = information.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full",
        "border px-3 py-1 text-xs font-semibold",
        information.classes,
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />

      {information.label}
    </span>
  );
}