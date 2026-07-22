"use client";

import { useRef, useState } from "react";
import { Upload, FileImage, Music2 } from "lucide-react";

interface FileDropzoneProps {
  label: string;
  description: string;
  accept: string;
  icon?: "image" | "audio";
  onFileSelected: (file: File) => void;
  previewUrl?: string;
  disabled?: boolean;
}

export default function FileDropzone({
  label,
  description,
  accept,
  icon = "image",
  onFileSelected,
  previewUrl,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    onFileSelected(files[0]);
  }

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          if (!disabled) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={[
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 transition",
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10 bg-black/20 hover:border-blue-500/40",
          disabled && "pointer-events-none opacity-50",
        ].join(" ")}
      >
        <div className="flex flex-col items-center text-center">
          {previewUrl ? (
            icon === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="mb-4 h-48 w-full rounded-xl object-cover"
              />
            ) : (
              <audio
                controls
                src={previewUrl}
                className="mb-4 w-full"
              />
            )
          ) : icon === "image" ? (
            <FileImage className="mb-4 h-14 w-14 text-blue-400" />
          ) : (
            <Music2 className="mb-4 h-14 w-14 text-blue-400" />
          )}

          <h3 className="text-lg font-semibold text-white">
            {label}
          </h3>

          <p className="mt-2 max-w-md text-sm text-white/45">
            {description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold">
            <Upload className="h-4 w-4" />
            Seleccionar archivo
          </div>
        </div>
      </div>
    </>
  );
}