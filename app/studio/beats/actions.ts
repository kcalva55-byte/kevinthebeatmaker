"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "../../../lib/supabase/server";

type BeatStatus = "draft" | "published";

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type ActionResult = {
  success: boolean;
  message: string;
};

type StoredBeat = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  audio_url: string | null;
  created_by: string | null;
};

const COVER_BUCKET = "beat-covers";
const AUDIO_BUCKET = "beat-audio";

const MAX_COVER_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

function isValidFile(
  value: FormDataEntryValue | null,
): value is File {
  return value instanceof File && value.size > 0;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFileExtension(
  fileName: string,
  fallback: string,
) {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  return extension || fallback;
}

function buildStoragePath(
  userId: string,
  slug: string,
  originalName: string,
  fallbackExtension: string,
) {
  const extension = getFileExtension(
    originalName,
    fallbackExtension,
  );

  const safeSlug =
    sanitizeFileName(slug) || `beat-${Date.now()}`;

  return `${userId}/${safeSlug}-${crypto.randomUUID()}.${extension}`;
}

function extractStoragePath(
  publicUrl: string | null,
  bucket: string,
) {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  const path = publicUrl.slice(
    markerIndex + marker.length,
  );

  return decodeURIComponent(path);
}

function validateBeatFields(formData: FormData) {
  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const genre = String(
    formData.get("genre") ?? "",
  ).trim();

  const musicalKey = String(
    formData.get("musicalKey") ?? "",
  ).trim();

  const bpm = Number(formData.get("bpm"));
  const price = Number(formData.get("price"));

  const rawStatus = String(
    formData.get("status") ?? "draft",
  );

  const status: BeatStatus =
    rawStatus === "published"
      ? "published"
      : "draft";

  if (
    !title ||
    !genre ||
    !musicalKey ||
    !Number.isFinite(bpm) ||
    bpm <= 0 ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return {
      success: false as const,
      message:
        "Completa correctamente el título, género, BPM, tonalidad y precio.",
    };
  }

  return {
    success: true as const,
    data: {
      title,
      genre,
      musicalKey,
      bpm,
      price,
      status,
    },
  };
}

async function getAuthenticatedClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
    error,
  };
}

function refreshBeatPages() {
  revalidatePath("/studio");
  revalidatePath("/studio/beats");
  revalidatePath("/");
}

export async function createBeat(
  formData: FormData,
): Promise<ActionResult> {
  const {
    supabase,
    user,
    error: userError,
  } = await getAuthenticatedClient();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Tu sesión expiró. Inicia sesión nuevamente.",
    };
  }

  const validation = validateBeatFields(formData);

  if (!validation.success) {
    return validation;
  }

  const {
    title,
    genre,
    musicalKey,
    bpm,
    price,
    status,
  } = validation.data;

  const coverFile = formData.get("cover");
  const audioFile = formData.get("audio");

  if (!isValidFile(coverFile)) {
    return {
      success: false,
      message: "Selecciona una portada.",
    };
  }

  if (!isValidFile(audioFile)) {
    return {
      success: false,
      message: "Selecciona un archivo de audio.",
    };
  }

  if (!coverFile.type.startsWith("image/")) {
    return {
      success: false,
      message:
        "La portada debe ser una imagen válida.",
    };
  }

  if (!audioFile.type.startsWith("audio/")) {
    return {
      success: false,
      message:
        "El archivo seleccionado debe ser un audio.",
    };
  }

  if (coverFile.size > MAX_COVER_SIZE) {
    return {
      success: false,
      message:
        "La portada no puede superar los 5 MB.",
    };
  }

  if (audioFile.size > MAX_AUDIO_SIZE) {
    return {
      success: false,
      message:
        "El audio no puede superar los 25 MB.",
    };
  }

  const baseSlug =
    createSlug(title) || `beat-${Date.now()}`;

  const slug = `${baseSlug}-${crypto
    .randomUUID()
    .slice(0, 8)}`;

  const coverPath = buildStoragePath(
    user.id,
    slug,
    coverFile.name,
    "webp",
  );

  const audioPath = buildStoragePath(
    user.id,
    slug,
    audioFile.name,
    "mp3",
  );

  const { error: coverUploadError } =
    await supabase.storage
      .from(COVER_BUCKET)
      .upload(coverPath, coverFile, {
        cacheControl: "3600",
        contentType: coverFile.type,
        upsert: false,
      });

  if (coverUploadError) {
    return {
      success: false,
      message: `No se pudo subir la portada: ${coverUploadError.message}`,
    };
  }

  const { error: audioUploadError } =
    await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(audioPath, audioFile, {
        cacheControl: "3600",
        contentType: audioFile.type,
        upsert: false,
      });

  if (audioUploadError) {
    await supabase.storage
      .from(COVER_BUCKET)
      .remove([coverPath]);

    return {
      success: false,
      message: `No se pudo subir el audio: ${audioUploadError.message}`,
    };
  }

  const {
    data: { publicUrl: coverUrl },
  } = supabase.storage
    .from(COVER_BUCKET)
    .getPublicUrl(coverPath);

  const {
    data: { publicUrl: audioUrl },
  } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(audioPath);

  const { error: insertError } = await supabase
    .from("beats")
    .insert({
      title,
      slug,
      genre,
      bpm,
      musical_key: musicalKey,
      price,
      status,
      cover_url: coverUrl,
      audio_url: audioUrl,
      plays: 0,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    await Promise.all([
      supabase.storage
        .from(COVER_BUCKET)
        .remove([coverPath]),

      supabase.storage
        .from(AUDIO_BUCKET)
        .remove([audioPath]),
    ]);

    return {
      success: false,
      message: `No se pudo guardar el beat: ${insertError.message}`,
    };
  }

  refreshBeatPages();

  return {
    success: true,
    message: "Beat guardado correctamente.",
  };
}

export async function updateBeat(
  beatId: string,
  formData: FormData,
): Promise<ActionResult> {
  const {
    supabase,
    user,
    error: userError,
  } = await getAuthenticatedClient();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Tu sesión expiró. Inicia sesión nuevamente.",
    };
  }

  const validation = validateBeatFields(formData);

  if (!validation.success) {
    return validation;
  }

  const { data: existingBeat, error: readError } =
    await supabase
      .from("beats")
      .select(
        "id,title,slug,cover_url,audio_url,created_by",
      )
      .eq("id", beatId)
      .single<StoredBeat>();

  if (readError || !existingBeat) {
    return {
      success: false,
      message: "No se encontró el beat.",
    };
  }

  if (existingBeat.created_by !== user.id) {
    return {
      success: false,
      message:
        "No tienes autorización para editar este beat.",
    };
  }

  const {
    title,
    genre,
    musicalKey,
    bpm,
    price,
    status,
  } = validation.data;

  const coverFile = formData.get("cover");
  const audioFile = formData.get("audio");

  let newCoverUrl = existingBeat.cover_url;
  let newAudioUrl = existingBeat.audio_url;

  let newCoverPath: string | null = null;
  let newAudioPath: string | null = null;

  if (isValidFile(coverFile)) {
    if (!coverFile.type.startsWith("image/")) {
      return {
        success: false,
        message:
          "La nueva portada debe ser una imagen válida.",
      };
    }

    if (coverFile.size > MAX_COVER_SIZE) {
      return {
        success: false,
        message:
          "La portada no puede superar los 5 MB.",
      };
    }

    newCoverPath = buildStoragePath(
      user.id,
      existingBeat.slug,
      coverFile.name,
      "webp",
    );

    const { error } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(newCoverPath, coverFile, {
        cacheControl: "3600",
        contentType: coverFile.type,
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        message: `No se pudo subir la nueva portada: ${error.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(COVER_BUCKET)
      .getPublicUrl(newCoverPath);

    newCoverUrl = publicUrl;
  }

  if (isValidFile(audioFile)) {
    if (!audioFile.type.startsWith("audio/")) {
      if (newCoverPath) {
        await supabase.storage
          .from(COVER_BUCKET)
          .remove([newCoverPath]);
      }

      return {
        success: false,
        message:
          "El nuevo archivo debe ser un audio válido.",
      };
    }

    if (audioFile.size > MAX_AUDIO_SIZE) {
      if (newCoverPath) {
        await supabase.storage
          .from(COVER_BUCKET)
          .remove([newCoverPath]);
      }

      return {
        success: false,
        message:
          "El audio no puede superar los 25 MB.",
      };
    }

    newAudioPath = buildStoragePath(
      user.id,
      existingBeat.slug,
      audioFile.name,
      "mp3",
    );

    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(newAudioPath, audioFile, {
        cacheControl: "3600",
        contentType: audioFile.type,
        upsert: false,
      });

    if (error) {
      if (newCoverPath) {
        await supabase.storage
          .from(COVER_BUCKET)
          .remove([newCoverPath]);
      }

      return {
        success: false,
        message: `No se pudo subir el nuevo audio: ${error.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(newAudioPath);

    newAudioUrl = publicUrl;
  }

  const { error: updateError } = await supabase
    .from("beats")
    .update({
      title,
      genre,
      bpm,
      musical_key: musicalKey,
      price,
      status,
      cover_url: newCoverUrl,
      audio_url: newAudioUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beatId);

  if (updateError) {
    const cleanupTasks = [];

    if (newCoverPath) {
      cleanupTasks.push(
        supabase.storage
          .from(COVER_BUCKET)
          .remove([newCoverPath]),
      );
    }

    if (newAudioPath) {
      cleanupTasks.push(
        supabase.storage
          .from(AUDIO_BUCKET)
          .remove([newAudioPath]),
      );
    }

    await Promise.all(cleanupTasks);

    return {
      success: false,
      message: `No se pudo actualizar el beat: ${updateError.message}`,
    };
  }

  const oldCoverPath = extractStoragePath(
    existingBeat.cover_url,
    COVER_BUCKET,
  );

  const oldAudioPath = extractStoragePath(
    existingBeat.audio_url,
    AUDIO_BUCKET,
  );

  const removalTasks = [];

  if (newCoverPath && oldCoverPath) {
    removalTasks.push(
      supabase.storage
        .from(COVER_BUCKET)
        .remove([oldCoverPath]),
    );
  }

  if (newAudioPath && oldAudioPath) {
    removalTasks.push(
      supabase.storage
        .from(AUDIO_BUCKET)
        .remove([oldAudioPath]),
    );
  }

  await Promise.all(removalTasks);

  refreshBeatPages();

  return {
    success: true,
    message: "Beat actualizado correctamente.",
  };
}

export async function changeBeatStatus(
  beatId: string,
  status: BeatStatus,
): Promise<ActionResult> {
  const {
    supabase,
    user,
    error: userError,
  } = await getAuthenticatedClient();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Tu sesión expiró. Inicia sesión nuevamente.",
    };
  }

  const safeStatus: BeatStatus =
    status === "published"
      ? "published"
      : "draft";

  const { error } = await supabase
    .from("beats")
    .update({
      status: safeStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beatId)
    .eq("created_by", user.id);

  if (error) {
    return {
      success: false,
      message: `No se pudo cambiar el estado: ${error.message}`,
    };
  }

  refreshBeatPages();

  return {
    success: true,
    message:
      safeStatus === "published"
        ? "Beat publicado correctamente."
        : "Beat guardado como borrador.",
  };
}

export async function deleteBeat(
  beatId: string,
): Promise<ActionResult> {
  const {
    supabase,
    user,
    error: userError,
  } = await getAuthenticatedClient();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Tu sesión expiró. Inicia sesión nuevamente.",
    };
  }

  const { data: beat, error: readError } =
    await supabase
      .from("beats")
      .select(
        "id,title,slug,cover_url,audio_url,created_by",
      )
      .eq("id", beatId)
      .single<StoredBeat>();

  if (readError || !beat) {
    return {
      success: false,
      message: "No se encontró el beat.",
    };
  }

  if (beat.created_by !== user.id) {
    return {
      success: false,
      message:
        "No tienes autorización para eliminar este beat.",
    };
  }

  const { error: deleteError } = await supabase
    .from("beats")
    .delete()
    .eq("id", beatId)
    .eq("created_by", user.id);

  if (deleteError) {
    return {
      success: false,
      message: `No se pudo eliminar el beat: ${deleteError.message}`,
    };
  }

  const coverPath = extractStoragePath(
    beat.cover_url,
    COVER_BUCKET,
  );

  const audioPath = extractStoragePath(
    beat.audio_url,
    AUDIO_BUCKET,
  );

  const removalTasks = [];

  if (coverPath) {
    removalTasks.push(
      supabase.storage
        .from(COVER_BUCKET)
        .remove([coverPath]),
    );
  }

  if (audioPath) {
    removalTasks.push(
      supabase.storage
        .from(AUDIO_BUCKET)
        .remove([audioPath]),
    );
  }

  const removalResults =
    await Promise.all(removalTasks);

  const storageError = removalResults.find(
    (result) => result.error,
  )?.error;

  refreshBeatPages();

  if (storageError) {
    return {
      success: true,
      message:
        "El beat fue eliminado, pero uno de sus archivos no pudo borrarse del Storage.",
    };
  }

  return {
    success: true,
    message:
      "Beat y archivos eliminados correctamente.",
  };
}