import { NextResponse } from "next/server";

import { createClient } from "../../../../../lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface StorageFile {
  bucket: string;
  path: string;
}

function getStorageFileFromPublicUrl(
  urlValue: string | null,
): StorageFile | null {
  if (!urlValue) {
    return null;
  }

  try {
    const url = new URL(urlValue);
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const storagePath = url.pathname.slice(
      markerIndex + marker.length,
    );

    const [encodedBucket, ...encodedPathParts] =
      storagePath.split("/");

    if (!encodedBucket || encodedPathParts.length === 0) {
      return null;
    }

    const bucket = decodeURIComponent(encodedBucket);

    const path = encodedPathParts
      .map((part) => decodeURIComponent(part))
      .join("/");

    if (!bucket || !path) {
      return null;
    }

    return {
      bucket,
      path,
    };
  } catch {
    return null;
  }
}

async function getAuthenticatedAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        {
          error:
            "Tu sesión expiró. Inicia sesión nuevamente.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  const { data: adminUser, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

  if (adminError) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        {
          error: adminError.message,
        },
        {
          status: 500,
        },
      ),
    };
  }

  if (!adminUser) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        {
          error:
            "No tienes autorización para administrar beats.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    supabase,
    user,
    errorResponse: null,
  };
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "No se recibió el identificador del beat.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      supabase,
      user,
      errorResponse,
    } = await getAuthenticatedAdmin();

    if (errorResponse || !user) {
      return errorResponse;
    }

    const { data: beat, error: beatError } =
      await supabase
        .from("beats")
        .select(
          `
            id,
            title,
            cover_url,
            audio_url,
            wav_url,
            stems_url
          `,
        )
        .eq("id", id)
        .maybeSingle();

    if (beatError) {
      return NextResponse.json(
        {
          error: beatError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!beat) {
      return NextResponse.json(
        {
          error:
            "El beat no existe o ya fue eliminado.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      count: orderItemsCount,
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("beat_id", id);

    if (orderItemsError) {
      return NextResponse.json(
        {
          error:
            "No fue posible comprobar si el beat tiene pedidos asociados.",
        },
        {
          status: 500,
        },
      );
    }

    if ((orderItemsCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Este beat tiene pedidos asociados y no puede eliminarse. Puedes archivarlo para ocultarlo de la tienda.",
          code: "BEAT_HAS_ORDERS",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Primero eliminamos el registro.
     * Si la base de datos rechaza la operación,
     * los archivos permanecen intactos.
     */
    const { error: deleteError } = await supabase
      .from("beats")
      .delete()
      .eq("id", id);

    if (deleteError) {
      if (deleteError.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Este beat está relacionado con pedidos y no puede eliminarse. Puedes archivarlo.",
            code: "BEAT_HAS_ORDERS",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error: deleteError.message,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Una vez eliminado el registro,
     * limpiamos los archivos de Storage.
     */
    const storageFiles = [
      getStorageFileFromPublicUrl(beat.cover_url),
      getStorageFileFromPublicUrl(beat.audio_url),
      getStorageFileFromPublicUrl(beat.wav_url),
      getStorageFileFromPublicUrl(beat.stems_url),
    ].filter(
      (file): file is StorageFile => file !== null,
    );

    const filesByBucket = new Map<string, string[]>();

    storageFiles.forEach(({ bucket, path }) => {
      const currentPaths =
        filesByBucket.get(bucket) ?? [];

      currentPaths.push(path);
      filesByBucket.set(bucket, currentPaths);
    });

    const storageWarnings: string[] = [];

    for (const [bucket, paths] of filesByBucket.entries()) {
      const { error: removeError } =
        await supabase.storage
          .from(bucket)
          .remove(paths);

      if (removeError) {
        storageWarnings.push(
          `${bucket}: ${removeError.message}`,
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        title: beat.title,
        storageWarnings,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible eliminar el beat.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "No se recibió el identificador del beat.",
        },
        {
          status: 400,
        },
      );
    }

    let body: {
      action?: string;
    };

    try {
      body = (await request.json()) as {
        action?: string;
      };
    } catch {
      return NextResponse.json(
        {
          error:
            "El contenido de la solicitud no es válido.",
        },
        {
          status: 400,
        },
      );
    }

    if (body.action !== "archive") {
      return NextResponse.json(
        {
          error:
            "La acción solicitada no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      supabase,
      user,
      errorResponse,
    } = await getAuthenticatedAdmin();

    if (errorResponse || !user) {
      return errorResponse;
    }

    const { data: beat, error: beatError } =
      await supabase
        .from("beats")
        .select("id, title, status")
        .eq("id", id)
        .maybeSingle();

    if (beatError) {
      return NextResponse.json(
        {
          error: beatError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!beat) {
      return NextResponse.json(
        {
          error: "El beat no existe.",
        },
        {
          status: 404,
        },
      );
    }

    if (beat.status === "archived") {
      return NextResponse.json(
        {
          success: true,
          title: beat.title,
          status: "archived",
        },
        {
          status: 200,
        },
      );
    }

    const {
      data: updatedBeat,
      error: updateError,
    } = await supabase
      .from("beats")
      .update({
        status: "archived",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, title, status")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        title: updatedBeat.title,
        status: updatedBeat.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible archivar el beat.",
      },
      {
        status: 500,
      },
    );
  }
}