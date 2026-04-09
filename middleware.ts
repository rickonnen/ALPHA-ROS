import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  //Interceptar cuando NextAuth redirige con error
  if (url.pathname === "/api/auth/signin") {
    if (url.searchParams.get("error")) {
      // Hay error → redirigir al inicio limpiamente
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Todo lo demás pasa normal sin tocar
  return NextResponse.next();
}

export const config = {
  // Solo actuar en esta ruta específica
  matcher: ["/api/auth/signin"],
};