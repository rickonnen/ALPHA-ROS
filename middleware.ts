import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Interceptar cuando NextAuth redirige con error
  if (pathname === "/api/auth/signin" && url.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const bolRutaPublicacionProtegida =
    pathname.startsWith("/publicacion/informacion-comercial") ||
    pathname.startsWith("/publicacion/Caracteristicas") ||
    pathname.startsWith("/publicacion/sumario") ||
    pathname.startsWith("/frontend/publicacion/informacion-comercial") ||
    pathname.startsWith("/frontend/publicacion/Caracteristicas") ||
    pathname.startsWith("/frontend/publicacion/sumario");

  if (bolRutaPublicacionProtegida) {
    const bolTieneAuthToken = Boolean(request.cookies.get("auth_token")?.value);
    const bolTieneSesionNextAuth = Boolean(
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value
    );

    if (!bolTieneAuthToken && !bolTieneSesionNextAuth) {
      const objLoginUrl = new URL("/", request.url);
      objLoginUrl.searchParams.set("auth", "login");
      objLoginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(objLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/signin",
    "/publicacion/informacion-comercial/:path*",
    "/publicacion/Caracteristicas/:path*",
    "/publicacion/sumario/:path*",
    "/frontend/publicacion/informacion-comercial/:path*",
    "/frontend/publicacion/Caracteristicas/:path*",
    "/frontend/publicacion/sumario/:path*",
  ],
};
