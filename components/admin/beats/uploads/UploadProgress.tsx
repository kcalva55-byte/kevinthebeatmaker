interface UploadProgressProps {
  progress: number;
  label?: string;
}

export default function UploadProgress({
  progress,
  label = "Subiendo archivo",
}: UploadProgressProps) {
  const safeProgress = Math.min(
    100,
    Math.max(0, Math.round(progress)),
  );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-white/50">
          {label}
        </p>

        <p className="text-xs font-semibold text-blue-300">
          {safeProgress}%
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
          style={{
            width: `${safeProgress}%`,
          }}
        />
      </div>
    </div>
  );
}