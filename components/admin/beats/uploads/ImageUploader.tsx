"use client";

import { useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import FileDropzone from "./FileDropzone";
import UploadProgress from "./UploadProgress";
import { uploadToStorage } from "./uploadToStorage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({
  value,
  onChange,
}: ImageUploaderProps) {
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
        bucket: "beat-covers",
        folder: "covers",
        file,
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
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
          : "No fue posible subir la imagen.",
      );
    }
  }

  return (
    <>
      <FileDropzone
        label="Portada"
        description="Arrastra una imagen o haz clic para seleccionarla."
        accept="image/*"
        icon="image"
        previewUrl={value}
        disabled={uploading}
        onFileSelected={handleFile}
      />

      {uploading && (
        <UploadProgress
          progress={progress}
          label="Subiendo portada..."
        />
      )}
    </>
  );
}