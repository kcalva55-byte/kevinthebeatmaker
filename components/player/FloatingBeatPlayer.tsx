"use client";

import {
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";

import { useBeatPlayer } from "../providers/BeatPlayerProvider";
import PlayerProgress from "./PlayerProgress";

export default function FloatingBeatPlayer() {
  const {
    currentBeat,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    muted,
    togglePlayback,
    playPrevious,
    playNext,
    seek,
    setVolume,
    toggleMuted,
    closePlayer,
  } = useBeatPlayer();

  if (!currentBeat) {
    return null;
  }

  const VolumeIcon = muted
    ? VolumeX
    : volume <= 0.45
      ? Volume1
      : Volume2;

  return (
    <aside className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#080b12]/95 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
        <div className="hidden items-center gap-6 md:grid md:grid-cols-[minmax(200px,1fr)_minmax(320px,1.5fr)_minmax(180px,1fr)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              {currentBeat.coverUrl ? (
                <Image
                  src={currentBeat.coverUrl}
                  alt={`Portada de ${currentBeat.title}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg font-bold text-white/25">
                  KTB
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {currentBeat.title}
              </p>

              <p className="mt-1 truncate text-xs text-white/40">
                {[
                  currentBeat.genre,
                  currentBeat.bpm
                    ? `${currentBeat.bpm} BPM`
                    : null,
                  currentBeat.musicalKey,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={playPrevious}
                aria-label="Beat anterior"
                className="rounded-full p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={togglePlayback}
                aria-label={
                  isPlaying
                    ? "Pausar reproducción"
                    : "Reproducir beat"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition hover:scale-105 hover:bg-blue-500"
              >
                {!isLoading && isPlaying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                aria-label="Siguiente beat"
                className="rounded-full p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <PlayerProgress
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={toggleMuted}
              aria-label={
                muted ? "Activar sonido" : "Silenciar"
              }
              className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              <VolumeIcon className="h-5 w-5" />
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={(event) =>
                setVolume(Number(event.target.value))
              }
              aria-label="Volumen"
              className="h-1 w-24 cursor-pointer accent-blue-500"
            />

            <button
              type="button"
              onClick={closePlayer}
              aria-label="Cerrar reproductor"
              className="ml-2 rounded-lg p-2 text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
              {currentBeat.coverUrl ? (
                <Image
                  src={currentBeat.coverUrl}
                  alt={`Portada de ${currentBeat.title}`}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-white/25">
                  KTB
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {currentBeat.title}
              </p>

              <p className="mt-0.5 truncate text-xs text-white/40">
                {currentBeat.genre || "Kevin The Beatmaker"}
              </p>
            </div>

            <button
              type="button"
              onClick={playPrevious}
              aria-label="Beat anterior"
              className="p-2 text-white/55"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              aria-label={
                isPlaying
                  ? "Pausar reproducción"
                  : "Reproducir beat"
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600"
            >
              {!isLoading && isPlaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              aria-label="Siguiente beat"
              className="p-2 text-white/55"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={closePlayer}
              aria-label="Cerrar reproductor"
              className="p-1 text-white/35"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2">
            <PlayerProgress
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              compact
            />
          </div>
        </div>
      </div>
    </aside>
  );
}