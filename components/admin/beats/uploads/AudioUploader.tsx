"use client";

import { useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import FileDropzone from "./FileDropzone";
import UploadProgress from "./UploadProgress";
import { uploadToStorage } from "./uploadToStorage";

interface AudioUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function AudioUploader({
  value,
  onChange,
}: AudioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    try {
      setUploading(true);
      setProgress(10);

      const supabase = createClient();

      setProgress(40);

      const result = await uploadToStorage({
        supabase,
        bucket: "beat-audio",
        folder: "audio",
        file,
        allowedTypes: [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/x-wav",
        ],
      });

      setProgress(100);

      onChange(result.publicUrl);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      setUploading(false);
      setProgress(0);

      alert(
        error instanceof Error
          ? error.message
          : "No fue posible subir el audio.",
      );
    }
  }

  return (
    <>
      <FileDropzone
        label="MP3 Preview"
        description="Arrastra el MP3 del beat."
        accept="audio/*"
        icon="audio"
        previewUrl={value}
        disabled={uploading}
        onFileSelected={handleFile}
      />

      {uploading && (
        <UploadProgress
          progress={progress}
          label="Subiendo audio..."
        />
      )}
    </>
  );
}