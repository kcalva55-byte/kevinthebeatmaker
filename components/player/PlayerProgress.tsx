"use client";

interface PlayerProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  compact?: boolean;
}

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

export default function PlayerProgress({
  currentTime,
  duration,
  onSeek,
  compact = false,
}: PlayerProgressProps) {
  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  return (
    <div className="flex min-w-0 items-center gap-3">
      {!compact && (
        <span className="w-10 text-right text-xs tabular-nums text-white/40">
          {formatTime(currentTime)}
        </span>
      )}

      <div className="relative flex h-5 flex-1 items-center">
        <div className="absolute h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) =>
            onSeek(Number(event.target.value))
          }
          aria-label="Progreso de reproducción"
          className="absolute inset-0 h-5 w-full cursor-pointer opacity-0"
        />
      </div>

      {!compact && (
        <span className="w-10 text-xs tabular-nums text-white/40">
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}