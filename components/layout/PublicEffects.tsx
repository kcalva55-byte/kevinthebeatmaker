"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { useMood } from "../providers/MoodProvider";

const IntroLoader = dynamic(
  () => import("../animations/IntroLoader"),
  {
    ssr: false,
  },
);

const AmbientBackground = dynamic(
  () => import("../effects/AmbientBackground"),
  {
    ssr: false,
  },
);

const CursorGlow = dynamic(
  () => import("../animations/CursorGlow"),
  {
    ssr: false,
  },
);

const FloatingBeatPlayer = dynamic(
  () => import("../player/FloatingBeatPlayer"),
  {
    ssr: false,
  },
);

const lightweightRoutePrefixes = [
  "/admin",
  "/studio",
  "/checkout",
  "/login",
  "/privacy",
  "/terms",
  "/help",
];

export default function PublicEffects() {
  const pathname = usePathname();
  const { beats } = useMood();

  const shouldDisableEffects =
    lightweightRoutePrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    );

  if (shouldDisableEffects) {
    return null;
  }

  return (
    <>
      <IntroLoader />
      <AmbientBackground />
      <CursorGlow />

      {beats.length > 0 ? (
        <FloatingBeatPlayer />
      ) : null}
    </>
  );
}
