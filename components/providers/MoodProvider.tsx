"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Beat } from "../../data/beats";

type MoodContextValue = {
  beats: Beat[];
  activeBeat: Beat | null;
  activeBeatIndex: number;
  isPlaying: boolean;
  setActiveBeatIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  nextBeat: () => void;
  previousBeat: () => void;
};

const MoodContext = createContext<MoodContextValue | null>(
  null,
);

type MoodProviderProps = {
  children: ReactNode;
  initialBeats?: Beat[];
};

export default function MoodProvider({
  children,
  initialBeats = [],
}: MoodProviderProps) {
  const beats = initialBeats;

  const [activeBeatIndex, setActiveBeatIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const activeBeat =
    beats[activeBeatIndex] ?? beats[0] ?? null;

  useEffect(() => {
    if (beats.length === 0) {
      setActiveBeatIndex(0);
      setIsPlaying(false);
      return;
    }

    if (activeBeatIndex >= beats.length) {
      setActiveBeatIndex(0);
    }
  }, [activeBeatIndex, beats.length]);

  const selectBeat = (index: number) => {
    if (index < 0 || index >= beats.length) {
      return;
    }

    setActiveBeatIndex(index);
  };

  const nextBeat = () => {
    if (beats.length === 0) {
      return;
    }

    setActiveBeatIndex((current) =>
      current >= beats.length - 1
        ? 0
        : current + 1,
    );
  };

  const previousBeat = () => {
    if (beats.length === 0) {
      return;
    }

    setActiveBeatIndex((current) =>
      current === 0
        ? beats.length - 1
        : current - 1,
    );
  };

  useEffect(() => {
    if (!activeBeat) {
      return;
    }

    const root = document.documentElement;
    const mood = activeBeat.mood;

    root.style.setProperty(
      "--mood-primary",
      mood.primary,
    );

    root.style.setProperty(
      "--mood-secondary",
      mood.secondary,
    );

    root.style.setProperty(
      "--mood-ambient",
      mood.ambient,
    );

    root.style.setProperty(
      "--mood-glow",
      mood.glow,
    );

    root.style.setProperty(
      "--mood-particle",
      mood.particle,
    );

    root.style.setProperty(
      "--mood-intensity",
      isPlaying ? "1" : "0.55",
    );
  }, [activeBeat, isPlaying]);

  const value = useMemo(
    () => ({
      beats,
      activeBeat,
      activeBeatIndex,
      isPlaying,
      setActiveBeatIndex: selectBeat,
      setIsPlaying,
      nextBeat,
      previousBeat,
    }),
    [
      beats,
      activeBeat,
      activeBeatIndex,
      isPlaying,
    ],
  );

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);

  if (!context) {
    throw new Error(
      "useMood debe utilizarse dentro de MoodProvider.",
    );
  }

  return context;
}