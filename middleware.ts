import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/perfil", "/publicar", "/cobros"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Interceptar callback de Google con error
  if (url.pathname === "/api/auth/callback/google") {
    if (url.searchParams.get("error")) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("next-auth.callback-url");
      response.cookies.delete("next-auth.csrf-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.callback-url");
      return response;
    }
  }

  // Interceptar signin con error
  if (url.pathname === "/api/auth/signin") {
    if (url.searchParams.get("error")) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("next-auth.callback-url");
      response.cookies.delete("next-auth.csrf-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      return response;
    }
  }

  // Rutas protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      const meRes = await fetch(new URL("/api/auth/me", request.url), {
        headers: { cookie: `auth_token=${authToken}` },
      });
      if (meRes.status === 403 || meRes.status === 401) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("auth_token");
        return response;
      }
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/signin",
    "/api/auth/callback/google",
    "/perfil/:path*",
    "/publicar/:path*",
    "/cobros/:path*",
  ],
};