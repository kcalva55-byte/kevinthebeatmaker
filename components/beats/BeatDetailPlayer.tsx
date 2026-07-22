"use client";

import {
  Pause,
  Play,
  Repeat2,
  ShoppingCart,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type BeatDetailPlayerProps = {
  beatId: string;
  title: string;
  audioUrl: string;
  color: string;
  price: number;
  initialPlays: number;
};

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

export default function BeatDetailPlayer({
  beatId,
  title,
  audioUrl,
  color,
  price,
  initialPlays,
}: BeatDetailPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playWasCountedRef = useRef(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isRepeating, setIsRepeating] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(0.8);

  const [plays, setPlays] =
    useState(initialPlays);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    playWasCountedRef.current = false;
    setPlays(initialPlays);
  }, [beatId, initialPlays]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const registerPlay = async () => {
    if (playWasCountedRef.current) {
      return;
    }

    playWasCountedRef.current = true;

    try {
      const response = await fetch(
        `/api/beats/${beatId}/play`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo registrar la reproducción.",
        );
      }

      const data = (await response.json()) as {
        plays?: number;
      };

      if (typeof data.plays === "number") {
        setPlays(data.plays);
      }
    } catch (error) {
      playWasCountedRef.current = false;

      console.error(
        "Error al registrar reproducción:",
        error,
      );
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        void registerPlay();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(
        "No se pudo reproducir el beat:",
        error,
      );

      setIsPlaying(false);
    }
  };

  const handleProgressChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextTime = Number(
      event.target.value,
    );

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleEnded = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isRepeating) {
      audio.currentTime = 0;
      void audio.play();
      return;
    }

    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    setVolume((currentVolume) =>
      currentVolume === 0 ? 0.8 : 0,
    );
  };

  const hasAudio = Boolean(audioUrl);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(
            event.currentTarget.duration,
          );
        }}
        onDurationChange={(event) => {
          setDuration(
            event.currentTarget.duration,
          );
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(
            event.currentTarget.currentTime,
          );
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-xs font-bold uppercase tracking-[0.28em]"
            style={{ color }}
          >
            Reproductor oficial
          </p>

          <h2 className="mt-2 truncate text-xl font-black sm:text-2xl">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {new Intl.NumberFormat(
              "es-EC",
            ).format(plays)}{" "}
            reproducciones
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsRepeating(
              (currentValue) => !currentValue,
            )
          }
          aria-label="Repetir beat"
          aria-pressed={isRepeating}
          className="rounded-full border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
          style={{
            color: isRepeating
              ? color
              : undefined,
          }}
        >
          <Repeat2 size={21} />
        </button>
      </div>

      <div className="mt-8 flex items-center gap-5">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!hasAudio}
          aria-label={
            isPlaying
              ? "Pausar beat"
              : "Reproducir beat"
          }
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundColor: color,
            boxShadow: `0 16px 45px ${color}50`,
          }}
        >
          {isPlaying ? (
            <Pause
              size={28}
              fill="currentColor"
            />
          ) : (
            <Play
              size={28}
              fill="currentColor"
              className="translate-x-0.5"
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(
              currentTime,
              duration || 0,
            )}
            onChange={handleProgressChange}
            disabled={!hasAudio}
            aria-label="Progreso del beat"
            className="h-2 w-full cursor-pointer disabled:cursor-not-allowed"
            style={{
              accentColor: color,
            }}
          />

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>
              {formatTime(currentTime)}
            </span>

            <span>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {!hasAudio && (
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Este beat todavía no tiene un audio de
          demostración disponible.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            disabled={!hasAudio}
            aria-label={
              volume === 0
                ? "Activar sonido"
                : "Silenciar"
            }
            className="rounded-full p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {volume === 0 ? (
              <VolumeX size={21} />
            ) : volume < 0.5 ? (
              <Volume1 size={21} />
            ) : (
              <Volume2 size={21} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            disabled={!hasAudio}
            onChange={(event) =>
              setVolume(
                Number(event.target.value),
              )
            }
            aria-label="Volumen"
            className="w-32 cursor-pointer disabled:cursor-not-allowed"
            style={{
              accentColor: color,
            }}
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
          style={{
            backgroundColor: color,
            boxShadow: `0 14px 38px ${color}35`,
          }}
        >
          <ShoppingCart size={19} />

          Comprar por ${price.toFixed(2)}
        </button>
      </div>
    </div>
  );
}