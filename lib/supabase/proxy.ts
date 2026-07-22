import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /*
   * Rutas generales del área Studio
   */
  const isStudioRoute = pathname.startsWith("/studio");
  const isStudioLoginRoute = pathname === "/login";

  /*
   * Rutas del panel administrativo
   */
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";
  const isProtectedAdminRoute = isAdminRoute && !isAdminLoginRoute;

  /*
   * Verificamos si el usuario autenticado está registrado
   * como administrador activo.
   */
  let isActiveAdmin = false;

  if (user && isAdminRoute) {
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (!adminError && adminUser) {
      isActiveAdmin = true;
    }
  }

  /*
   * Protección del área Studio existente
   */
  if (!user && isStudioRoute) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (user && isStudioLoginRoute) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  /*
   * Protección del panel administrativo
   */
  if (!user && isProtectedAdminRoute) {
    const loginUrl = new URL("/admin/login", request.url);

    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Un usuario autenticado que no sea administrador
   * tampoco puede acceder al panel.
   */
  if (user && isProtectedAdminRoute && !isActiveAdmin) {
    const loginUrl = new URL("/admin/login", request.url);

    loginUrl.searchParams.set("error", "unauthorized");

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Si el administrador ya inició sesión, no necesita
   * volver a ver el formulario de login.
   */
  if (user && isAdminLoginRoute && isActiveAdmin) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url),
    );
  }

  return response;
}