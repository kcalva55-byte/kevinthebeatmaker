"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface PlayerBeat {
  id: string;
  title: string;
  slug?: string;
  genre: string | null;
  bpm: number | null;
  musicalKey: string | null;
  coverUrl: string | null;
  audioUrl: string;
  color?: string | null;
  durationLabel?: string | null;
  price?: number | string | null;
}

interface BeatPlayerContextValue {
  queue: PlayerBeat[];
  currentBeat: PlayerBeat | null;
  currentIndex: number;

  isPlaying: boolean;
  isLoading: boolean;
  isRepeating: boolean;

  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;

  setQueue: (beats: PlayerBeat[]) => void;
  selectBeat: (
    beat: PlayerBeat,
    queue?: PlayerBeat[],
    autoplay?: boolean,
  ) => void;
  playBeat: (
    beat: PlayerBeat,
    queue?: PlayerBeat[],
  ) => void;

  togglePlayback: () => void;
  playPrevious: () => void;
  playNext: () => void;

  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
  toggleRepeat: () => void;
  closePlayer: () => void;
}

const BeatPlayerContext =
  createContext<BeatPlayerContextValue | null>(null);

interface BeatPlayerProviderProps {
  children: ReactNode;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

export default function BeatPlayerProvider({
  children,
}: BeatPlayerProviderProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const queueRef = useRef<PlayerBeat[]>([]);
  const indexRef = useRef(-1);
  const repeatingRef = useRef(false);

  const [queue, setQueueState] = useState<
    PlayerBeat[]
  >([]);

  const [currentBeat, setCurrentBeat] =
    useState<PlayerBeat | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(-1);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isRepeating, setIsRepeating] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolumeState] =
    useState(0.8);

  const [muted, setMuted] =
    useState(false);

  const loadBeat = useCallback(
    async (
      beat: PlayerBeat,
      autoplay: boolean,
    ) => {
      const audio = audioRef.current;

      if (!audio || !beat.audioUrl) {
        return;
      }

      audio.pause();

      setCurrentBeat(beat);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setIsPlaying(false);

      audio.src = beat.audioUrl;
      audio.load();

      if (!autoplay) {
        return;
      }

      try {
        await audio.play();
      } catch (error) {
        console.error(
          "No se pudo reproducir el beat:",
          error,
        );

        setIsPlaying(false);
        setIsLoading(false);
      }
    },
    [],
  );

  const playIndex = useCallback(
    (index: number) => {
      const currentQueue = queueRef.current;

      if (currentQueue.length === 0) {
        return;
      }

      const normalizedIndex =
        ((index % currentQueue.length) +
          currentQueue.length) %
        currentQueue.length;

      const beat =
        currentQueue[normalizedIndex];

      if (!beat) {
        return;
      }

      indexRef.current = normalizedIndex;
      setCurrentIndex(normalizedIndex);

      void loadBeat(beat, true);
    },
    [loadBeat],
  );

  useEffect(() => {
    const audioElement = new Audio();

    audioElement.preload = "metadata";
    audioElement.volume = volume;

    audioRef.current = audioElement;

    const handleLoadedMetadata = () => {
      const nextDuration =
        Number.isFinite(
          audioElement.duration,
        )
          ? audioElement.duration
          : 0;

      setDuration(nextDuration);
      setIsLoading(false);
    };

    const handleDurationChange = () => {
      if (
        Number.isFinite(
          audioElement.duration,
        )
      ) {
        setDuration(
          audioElement.duration,
        );
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(
        audioElement.currentTime,
      );
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      if (repeatingRef.current) {
        audioElement.currentTime = 0;

        void audioElement
          .play()
          .catch((error) => {
            console.error(
              "No se pudo repetir el beat:",
              error,
            );
          });

        return;
      }

      playIndex(indexRef.current + 1);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);

      console.error(
        "No se pudo cargar el archivo de audio.",
      );
    };

    audioElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    audioElement.addEventListener(
      "durationchange",
      handleDurationChange,
    );

    audioElement.addEventListener(
      "timeupdate",
      handleTimeUpdate,
    );

    audioElement.addEventListener(
      "play",
      handlePlay,
    );

    audioElement.addEventListener(
      "pause",
      handlePause,
    );

    audioElement.addEventListener(
      "waiting",
      handleWaiting,
    );

    audioElement.addEventListener(
      "canplay",
      handleCanPlay,
    );

    audioElement.addEventListener(
      "ended",
      handleEnded,
    );

    audioElement.addEventListener(
      "error",
      handleError,
    );

    return () => {
      audioElement.pause();
      audioElement.removeAttribute("src");

      audioElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      audioElement.removeEventListener(
        "durationchange",
        handleDurationChange,
      );

      audioElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate,
      );

      audioElement.removeEventListener(
        "play",
        handlePlay,
      );

      audioElement.removeEventListener(
        "pause",
        handlePause,
      );

      audioElement.removeEventListener(
        "waiting",
        handleWaiting,
      );

      audioElement.removeEventListener(
        "canplay",
        handleCanPlay,
      );

      audioElement.removeEventListener(
        "ended",
        handleEnded,
      );

      audioElement.removeEventListener(
        "error",
        handleError,
      );

      audioRef.current = null;
    };
  }, [playIndex]);

  const setQueue = useCallback(
    (beats: PlayerBeat[]) => {
      queueRef.current = beats;
      setQueueState(beats);

      if (beats.length === 0) {
        indexRef.current = -1;
        setCurrentIndex(-1);
        return;
      }

      setCurrentBeat((activeBeat) => {
        if (!activeBeat) {
          indexRef.current = 0;
          setCurrentIndex(0);

          return null;
        }

        const nextIndex =
          beats.findIndex(
            (beat) =>
              beat.id === activeBeat.id,
          );

        const normalizedIndex =
          nextIndex >= 0 ? nextIndex : 0;

        indexRef.current =
          normalizedIndex;

        setCurrentIndex(
          normalizedIndex,
        );

        return activeBeat;
      });
    },
    [],
  );

  const selectBeat = useCallback(
    (
      beat: PlayerBeat,
      newQueue?: PlayerBeat[],
      autoplay = false,
    ) => {
      const effectiveQueue =
        newQueue &&
        newQueue.length > 0
          ? newQueue
          : queueRef.current;

      if (
        newQueue &&
        newQueue.length > 0
      ) {
        queueRef.current = newQueue;
        setQueueState(newQueue);
      }

      let beatIndex =
        effectiveQueue.findIndex(
          (item) =>
            item.id === beat.id,
        );

      if (beatIndex < 0) {
        const updatedQueue = [
          ...effectiveQueue,
          beat,
        ];

        queueRef.current =
          updatedQueue;

        setQueueState(updatedQueue);

        beatIndex =
          updatedQueue.length - 1;
      }

      indexRef.current = beatIndex;
      setCurrentIndex(beatIndex);

      if (
        currentBeat?.id === beat.id
      ) {
        if (
          autoplay &&
          audioRef.current?.paused
        ) {
          void audioRef.current
            .play()
            .catch((error) => {
              console.error(
                "No se pudo reproducir el beat:",
                error,
              );
            });
        }

        return;
      }

      void loadBeat(beat, autoplay);
    },
    [currentBeat, loadBeat],
  );

  const playBeat = useCallback(
    (
      beat: PlayerBeat,
      newQueue?: PlayerBeat[],
    ) => {
      const audio = audioRef.current;

      if (
        currentBeat?.id === beat.id &&
        audio
      ) {
        if (audio.paused) {
          void audio
            .play()
            .catch((error) => {
              console.error(
                "No se pudo continuar la reproducción:",
                error,
              );
            });
        } else {
          audio.pause();
        }

        return;
      }

      selectBeat(
        beat,
        newQueue,
        true,
      );
    },
    [currentBeat, selectBeat],
  );

  const togglePlayback =
    useCallback(() => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (!currentBeat) {
        const firstBeat =
          queueRef.current[0];

        if (firstBeat) {
          selectBeat(
            firstBeat,
            queueRef.current,
            true,
          );
        }

        return;
      }

      if (audio.paused) {
        void audio
          .play()
          .catch((error) => {
            console.error(
              "No se pudo continuar la reproducción:",
              error,
            );
          });
      } else {
        audio.pause();
      }
    }, [currentBeat, selectBeat]);

  const playPrevious =
    useCallback(() => {
      const audio = audioRef.current;

      if (
        audio &&
        audio.currentTime > 3
      ) {
        audio.currentTime = 0;
        setCurrentTime(0);
        return;
      }

      playIndex(indexRef.current - 1);
    }, [playIndex]);

  const playNext = useCallback(() => {
    playIndex(indexRef.current + 1);
  }, [playIndex]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;

      if (
        !audio ||
        !Number.isFinite(audio.duration)
      ) {
        return;
      }

      const nextTime = clamp(
        time,
        0,
        audio.duration,
      );

      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [],
  );

  const setVolume = useCallback(
    (nextVolume: number) => {
      const audio = audioRef.current;

      const normalizedVolume =
        clamp(nextVolume, 0, 1);

      setVolumeState(
        normalizedVolume,
      );

      setMuted(false);

      if (audio) {
        audio.volume =
          normalizedVolume;

        audio.muted = false;
      }
    },
    [],
  );

  const toggleMuted =
    useCallback(() => {
      const audio = audioRef.current;

      setMuted((currentMuted) => {
        const nextMuted =
          !currentMuted;

        if (audio) {
          audio.muted = nextMuted;
        }

        return nextMuted;
      });
    }, []);

  const toggleRepeat =
    useCallback(() => {
      setIsRepeating(
        (currentValue) => {
          const nextValue =
            !currentValue;

          repeatingRef.current =
            nextValue;

          return nextValue;
        },
      );
    }, []);

  const closePlayer =
    useCallback(() => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }

      setCurrentBeat(null);
      setCurrentIndex(-1);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsLoading(false);

      indexRef.current = -1;
    }, []);

  const value =
    useMemo<BeatPlayerContextValue>(
      () => ({
        queue,
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
        closePlayer,
      }),
      [
        queue,
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
        closePlayer,
      ],
    );

  return (
    <BeatPlayerContext.Provider
      value={value}
    >
      {children}
    </BeatPlayerContext.Provider>
  );
}

export function useBeatPlayer() {
  const context =
    useContext(BeatPlayerContext);

  if (!context) {
    throw new Error(
      "useBeatPlayer debe utilizarse dentro de BeatPlayerProvider.",
    );
  }

  return context;
}