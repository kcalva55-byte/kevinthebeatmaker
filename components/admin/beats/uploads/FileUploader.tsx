"use client";

import { useState } from "react";
import { FileArchive, FileMusic } from "lucide-react";

import { createClient } from "../../../../lib/supabase/client";
import FileDropzone from "./FileDropzone";
import UploadProgress from "./UploadProgress";
import { uploadToStorage } from "./uploadToStorage";

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  type: "wav" | "stems";
}

const configurations = {
  wav: {
    label: "Archivo WAV",
    description:
      "Arrastra el archivo WAV de alta calidad o haz clic para seleccionarlo.",
    bucket: "beat-wav",
    folder: "wav",
    accept: ".wav,audio/wav,audio/x-wav,audio/wave,audio/vnd.wave",
    allowedTypes: [
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/vnd.wave",
    ],
    maxSizeMb: 50,
  },
  stems: {
    label: "STEMS",
    description:
      "Arrastra el archivo ZIP con las pistas separadas.",
    bucket: "beat-stems",
    folder: "stems",
    accept:
      ".zip,application/zip,application/x-zip-compressed,application/octet-stream",
    allowedTypes: [
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
    ],
    maxSizeMb: 50,
  },
};

export default function FileUploader({
  value,
  onChange,
  type,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const config = configurations[type];

  async function handleFile(file: File) {
    setErrorMessage("");
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createClient();

      setProgress(35);

      const result = await uploadToStorage({
        supabase,
        bucket: config.bucket,
        folder: config.folder,
        file,
        allowedTypes: config.allowedTypes,
        maxSizeMb: config.maxSizeMb,
      });

      setProgress(100);
      onChange(result.publicUrl);

      window.setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      setUploading(false);
      setProgress(0);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible subir el archivo.",
      );
    }
  }

  return (
    <div>
      <FileDropzone
        label={config.label}
        description={config.description}
        accept={config.accept}
        icon="audio"
        disabled={uploading}
        onFileSelected={handleFile}
      />

      {uploading ? (
        <UploadProgress
          progress={progress}
          label={`Subiendo ${config.label.toLowerCase()}...`}
        />
      ) : null}

      {value ? (
  <div className="mt-4 flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
    {type === "wav" ? (
      <FileMusic className="h-5 w-5 shrink-0 text-emerald-300" />
    ) : (
      <FileArchive className="h-5 w-5 shrink-0 text-emerald-300" />
    )}

    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-emerald-200">
        Archivo subido correctamente
      </p>

      <p className="mt-1 max-w-full truncate text-xs text-emerald-200/55">
        Archivo guardado en Supabase Storage
      </p>
    </div>
  </div>
) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}