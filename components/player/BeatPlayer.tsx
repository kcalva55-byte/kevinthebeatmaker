"use client";

import {
  Heart,
  Loader2,
  Pause,
  Play,
  Repeat2,
  ShoppingCart,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type PlayerBeat,
  useBeatPlayer,
} from "../providers/BeatPlayerProvider";
import { useMood } from "../providers/MoodProvider";
import Link from "next/link";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function BeatPlayer() {
  const { beats } = useMood();

  const {
    currentBeat,
    currentIndex,
    isPlaying,
    isLoading,
    isRepeating,
    currentTime,
    duration,
    volume,
    muted,
    setQueue,
    selectBeat,
    playBeat,
    togglePlayback,
    playPrevious,
    playNext,
    seek,
    setVolume,
    toggleMuted,
    toggleRepeat,
  } = useBeatPlayer();

  const [selectedBeatId, setSelectedBeatId] =
    useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    [],
  );

  const playerBeats = useMemo<PlayerBeat[]>(
    () =>
      beats
        .filter((beat) => Boolean(beat.audio))
        .map((beat) => ({
          id: String(beat.id),
          title: beat.title,
          slug: beat.slug,
          genre: beat.genre ?? null,
          bpm: beat.bpm ?? null,
          musicalKey: beat.musicalKey ?? null,
          coverUrl: beat.cover ?? null,
           audioUrl: beat.audio,
          color: beat.color ?? "#2563eb",
          durationLabel: beat.duration ?? null,
        })),
    [beats],
  );

  useEffect(() => {
    setQueue(playerBeats);
  }, [playerBeats, setQueue]);

  useEffect(() => {
    if (currentBeat) {
      setSelectedBeatId(currentBeat.id);
      return;
    }

    if (!selectedBeatId && playerBeats[0]) {
      setSelectedBeatId(playerBeats[0].id);
    }
  }, [currentBeat, playerBeats, selectedBeatId]);

  const selectedBeat =
    playerBeats.find((beat) => beat.id === selectedBeatId) ??
    currentBeat ??
    playerBeats[0] ??
    null;

  if (!selectedBeat) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#07101f]/90 px-6 py-16 text-center text-slate-400">
        No hay beats disponibles.
      </div>
    );
  }

  const accentColor = selectedBeat.color || "#2563eb";

  const isSelectedPlaying =
    currentBeat?.id === selectedBeat.id && isPlaying;

  const isSelectedLoading =
    currentBeat?.id === selectedBeat.id && isLoading;

  const isFavorite = favoriteIds.includes(selectedBeat.id);

  const selectedDuration =
    currentBeat?.id === selectedBeat.id
      ? duration
      : 0;

  const selectedCurrentTime =
    currentBeat?.id === selectedBeat.id
      ? currentTime
      : 0;

  const accentStyle = {
    "--beat-color": accentColor,
  } as CSSProperties;

  function handleMainPlayback() {
    if (currentBeat?.id === selectedBeat.id) {
      togglePlayback();
      return;
    }

    playBeat(selectedBeat, playerBeats);
  }

  function handlePlaylistClick(beat: PlayerBeat) {
    setSelectedBeatId(beat.id);

    if (currentBeat?.id === beat.id) {
      togglePlayback();
      return;
    }

    selectBeat(beat, playerBeats, false);
  }

  function toggleFavorite() {
    setFavoriteIds((currentIds) =>
      currentIds.includes(selectedBeat.id)
        ? currentIds.filter((id) => id !== selectedBeat.id)
        : [...currentIds, selectedBeat.id],
    );
  }

  return (
    <div style={accentStyle} className="relative">
      <div
        className="
          relative overflow-hidden rounded-[2rem]
          border border-white/10 bg-[#07101f]/90
          p-5 shadow-2xl backdrop-blur-xl
          sm:p-8
        "
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-25 blur-[110px]"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[340px_1fr]">
          <div>
            <div
              className="
                relative aspect-square overflow-hidden rounded-[1.75rem]
                border border-white/10 bg-cover bg-center
                shadow-[0_30px_80px_rgba(0,0,0,.45)]
              "
              style={{
                backgroundImage: selectedBeat.coverUrl
                  ? `
                    linear-gradient(
                      to top,
                      rgba(3,7,18,.92),
                      rgba(3,7,18,.05)
                    ),
                    url("${selectedBeat.coverUrl}")
                  `
                  : `linear-gradient(135deg, ${accentColor}, #030712)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(
                    circle at 70% 20%,
                    ${accentColor},
                    transparent 46%
                  )`,
                }}
              />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Kevin The Beatmaker
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  {selectedBeat.title}
                </h3>

                <p
                  className="mt-2 font-semibold"
                  style={{ color: accentColor }}
                >
                  {selectedBeat.genre || "Instrumental"} Beat
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-[0.3em]"
                  style={{ color: accentColor }}
                >
                  {isSelectedPlaying
                    ? "Ahora reproduciendo"
                    : "Beat seleccionado"}
                </p>

                <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                  {selectedBeat.title}
                </h2>

                <p className="mt-3 text-slate-400">
                  {[
                    selectedBeat.genre,
                    selectedBeat.bpm
                      ? `${selectedBeat.bpm} BPM`
                      : null,
                    selectedBeat.musicalKey,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

<Link
  href={`/beats/${selectedBeat.slug ?? selectedBeat.id}`}
  className="
    inline-flex items-center justify-center
    rounded-full
    px-6 py-3
    font-semibold
    text-white
    transition
    hover:-translate-y-0.5
  "
  style={{
    backgroundColor: accentColor,
    boxShadow: `0 12px 35px ${accentColor}35`,
  }}
>
  Ver detalles
</Link>
            </div>

            <div className="mt-10">
              <input
                type="range"
                min={0}
                max={selectedDuration || 0}
                step={0.01}
                value={Math.min(
                  selectedCurrentTime,
                  selectedDuration || 0,
                )}
                onChange={(event) =>
                  seek(Number(event.target.value))
                }
                disabled={
                  currentBeat?.id !== selectedBeat.id ||
                  selectedDuration <= 0
                }
                aria-label="Progreso del audio"
                className="h-2 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{ accentColor }}
              />

              <div className="mt-3 flex justify-between text-sm text-slate-500">
                <span>{formatTime(selectedCurrentTime)}</span>

                <span>
                  {selectedDuration > 0
                    ? formatTime(selectedDuration)
                    : selectedBeat.durationLabel || "0:00"}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Repetir canción"
                aria-pressed={isRepeating}
                onClick={toggleRepeat}
                className="rounded-full p-3 transition hover:bg-white/10"
                style={{
                  color: isRepeating ? accentColor : undefined,
                }}
              >
                <Repeat2 size={22} />
              </button>

              <button
                type="button"
                aria-label="Beat anterior"
                onClick={playPrevious}
                disabled={playerBeats.length === 0}
                className="rounded-full p-3 transition hover:bg-white/10 disabled:opacity-40"
              >
                <SkipBack size={27} fill="currentColor" />
              </button>

              <button
                type="button"
                aria-label={
                  isSelectedPlaying
                    ? "Pausar beat"
                    : "Reproducir beat"
                }
                onClick={handleMainPlayback}
                className="
                  flex h-20 w-20 items-center justify-center rounded-full
                  text-white shadow-xl transition duration-300
                  hover:scale-105 active:scale-95
                "
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 15px 45px ${accentColor}55`,
                }}
              >
                {isSelectedLoading ? (
                  <Loader2 size={32} className="animate-spin" />
                ) : isSelectedPlaying ? (
                  <Pause size={34} fill="currentColor" />
                ) : (
                  <Play
                    size={34}
                    fill="currentColor"
                    className="translate-x-0.5"
                  />
                )}
              </button>

              <button
                type="button"
                aria-label="Siguiente beat"
                onClick={playNext}
                disabled={playerBeats.length === 0}
                className="rounded-full p-3 transition hover:bg-white/10 disabled:opacity-40"
              >
                <SkipForward size={27} fill="currentColor" />
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={
                    muted ? "Activar sonido" : "Silenciar"
                  }
                  onClick={toggleMuted}
                  className="rounded-full p-2 transition hover:bg-white/10"
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={22} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={22} />
                  ) : (
                    <Volume2 size={22} />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(event) =>
                    setVolume(Number(event.target.value))
                  }
                  aria-label="Volumen"
                  className="w-36 cursor-pointer"
                  style={{ accentColor }}
                />
              </div>

              <Link
  href={`/beats/${selectedBeat.slug ?? selectedBeat.id}`}
  className="
    inline-flex items-center justify-center gap-2 rounded-full
    px-6 py-3 font-semibold text-white transition
    hover:-translate-y-0.5
  "
  style={{
    backgroundColor: accentColor,
    boxShadow: `0 12px 35px ${accentColor}35`,
  }}
>
  Ver detalles
</Link>
            </div>
          </div>
        </div>

        <div className="relative mt-8 border-t border-white/10 pt-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Playlist
          </p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {playerBeats.map((beat, index) => {
              const isSelected =
                selectedBeat.id === beat.id;

              const beatIsPlaying =
                currentBeat?.id === beat.id && isPlaying;

              const beatIsLoading =
                currentBeat?.id === beat.id && isLoading;

              return (
                <button
                  type="button"
                  key={beat.id}
                  onClick={() => handlePlaylistClick(beat)}
                  className={`
                    flex items-center gap-4 rounded-2xl border p-3 text-left
                    transition duration-300 hover:-translate-y-0.5
                    ${
                      isSelected
                        ? "border-white/20 bg-white/10"
                        : "border-white/5 bg-white/[0.025] hover:bg-white/5"
                    }
                  `}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${beat.color || "#2563eb"},
                        #030712
                      )`,
                    }}
                  >
                    {beatIsLoading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : beatIsPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {beat.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {[
                        beat.genre,
                        beat.bpm ? `${beat.bpm} BPM` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <span className="sr-only">
                    Beat {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}