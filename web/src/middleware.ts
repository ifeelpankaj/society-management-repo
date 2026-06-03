import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/features/auth/auth-cookies";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
} from "@/features/auth/auth-routing";

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasAccessToken = Boolean(
    request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value,
  );

  if (!hasAccessToken) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/developer/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/select-society/:path*",
  ],
};
