"use client";

import type { ReactNode } from "react";

import FloatingBeatPlayer from "../components/player/FloatingBeatPlayer";
import BeatPlayerProvider from "../components/providers/BeatPlayerProvider";
import MoodProvider from "../components/providers/MoodProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <MoodProvider>
      <BeatPlayerProvider>
        {children}
        <FloatingBeatPlayer />
      </BeatPlayerProvider>
    </MoodProvider>
  );
}