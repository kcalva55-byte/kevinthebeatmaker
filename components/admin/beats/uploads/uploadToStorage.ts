import type { SupabaseClient } from "@supabase/supabase-js";

interface UploadToStorageOptions {
  supabase: SupabaseClient;
  bucket: string;
  file: File;
  folder?: string;
  allowedTypes?: string[];
  maxSizeMb?: number;
}

interface UploadToStorageResult {
  publicUrl: string;
  path: string;
}

function sanitizeFileName(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase()
    : "";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeBaseName = baseName || "archivo";

  return extension
    ? `${safeBaseName}.${extension}`
    : safeBaseName;
}

export async function uploadToStorage({
  supabase,
  bucket,
  file,
  folder = "uploads",
  allowedTypes,
  maxSizeMb = 50,
}: UploadToStorageOptions): Promise<UploadToStorageResult> {
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.");
  }

  if (
    allowedTypes?.length &&
    !allowedTypes.includes(file.type)
  ) {
    throw new Error(
      `Formato no permitido. Tipo recibido: ${
        file.type || "desconocido"
      }.`,
    );
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    throw new Error(
      `El archivo supera el límite de ${maxSizeMb} MB.`,
    );
  }

  const safeFileName = sanitizeFileName(file.name);
  const uniqueId = crypto.randomUUID();

  const cleanFolder = folder
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-");

  const path = `${cleanFolder}/${Date.now()}-${uniqueId}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    await supabase.storage
      .from(bucket)
      .remove([path]);

    throw new Error(
      "El archivo se subió, pero no fue posible obtener su URL pública.",
    );
  }

  return {
    publicUrl: data.publicUrl,
    path,
  };
}