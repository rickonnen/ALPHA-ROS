import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/signin", "/api/auth/callback/google"],
};