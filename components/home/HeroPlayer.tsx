"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

import { useMood } from "../providers/MoodProvider";
import AudioVisualizer from "../player/AudioVisualizer";

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

export default function HeroPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const {
    beats,
    activeBeat,
    activeBeatIndex,
    isPlaying,
    setActiveBeatIndex,
    setIsPlaying,
    nextBeat,
    previousBeat,
  } = useMood();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [analyser, setAnalyser] =
    useState<AnalyserNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.load();
    audio.volume = volume;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [activeBeatIndex, setIsPlaying, volume]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const initializeAudioGraph = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const audioContext = new AudioContextClass();
      const source =
        audioContext.createMediaElementSource(audio);
      const analyserNode =
        audioContext.createAnalyser();

      analyserNode.fftSize = 128;
      analyserNode.smoothingTimeConstant = 0.82;

      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);
    }

    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      await audioContextRef.current.resume();
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !activeBeat) {
      return;
    }

    try {
      await initializeAudioGraph();

      if (audio.paused) {
        await audio.play();
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTime = Number(event.target.value);

    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (!activeBeat) {
    return (
      <div className="mood-border mood-shadow relative overflow-hidden rounded-[2rem] border bg-[#06101f]/80 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <Play size={26} className="text-slate-500" />
        </div>

        <h3 className="mt-5 text-xl font-black text-white">
          Próximamente nuevos beats
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Actualmente no hay beats publicados. Muy pronto podrás escuchar
          nuevas producciones de Kevin The Beatmaker.
        </p>
      </div>
    );
  }

  return (
    <div className="mood-border mood-shadow relative overflow-hidden rounded-[2rem] border bg-[#06101f]/80 p-4 backdrop-blur-2xl sm:p-5">
      <audio
        ref={audioRef}
        src={activeBeat.audio}
        preload="metadata"
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration)
        }
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={nextBeat}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center sm:h-24 sm:w-24"
          style={{
            backgroundImage: `
              linear-gradient(to top, rgba(3,7,18,.72), transparent),
              url("${activeBeat.cover}")
            `,
          }}
        />

        <div className="min-w-0 flex-1">
          <p className="mood-text text-[10px] font-semibold uppercase tracking-[0.28em]">
            Ahora reproduciendo
          </p>

          <h3 className="mt-1 truncate text-xl font-black sm:text-2xl">
            {activeBeat.title}
          </h3>

          <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
            {activeBeat.genre} · {activeBeat.bpm} BPM ·{" "}
            {activeBeat.musicalKey}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={previousBeat}
              aria-label="Beat anterior"
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                isPlaying
                  ? "Pausar beat"
                  : "Reproducir beat"
              }
              className="mood-background flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause size={23} fill="currentColor" />
              ) : (
                <Play
                  size={23}
                  fill="currentColor"
                  className="translate-x-0.5"
                />
              )}
            </button>

            <button
              type="button"
              onClick={nextBeat}
              aria-label="Siguiente beat"
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>

            <Volume2
              size={17}
              className="ml-auto text-slate-500"
            />

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) =>
                setVolume(Number(event.target.value))
              }
              aria-label="Volumen"
              className="hidden w-20 cursor-pointer sm:block"
              style={{
                accentColor: activeBeat.color,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/5 bg-black/15 px-3 py-2">
        <AudioVisualizer
          analyser={analyser}
          isPlaying={isPlaying}
          color={activeBeat.color}
        />
      </div>

      <div className="relative mt-4">
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
          aria-label="Progreso del beat"
          className="h-1.5 w-full cursor-pointer"
          style={{
            accentColor: activeBeat.color,
          }}
        />

        <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
          <span>{formatTime(currentTime)}</span>

          <span>
            {duration > 0
              ? formatTime(duration)
              : activeBeat.duration}
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1">
        {beats.map((beat, index) => {
          const selected =
            index === activeBeatIndex;

          return (
            <button
              type="button"
              key={beat.id}
              onClick={() =>
                setActiveBeatIndex(index)
              }
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                selected
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/5 bg-white/[0.03] text-slate-500 hover:text-white"
              }`}
            >
              {beat.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}