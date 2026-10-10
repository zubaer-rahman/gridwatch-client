import { type NextRequest, NextResponse } from "next/server";

interface DecodedToken {
  userId: string;
  role: "ADMIN" | "OPERATOR" | "CUSTOMER";
  email: string;
  exp: number;
}

function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("gridwatch_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const isTokenValid = decoded && decoded.exp * 1000 > Date.now();

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email");

  const isProtectedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/operator") ||
    pathname.startsWith("/customer");

  // 1. If trying to access public auth page with valid session, redirect to role dashboard
  if (isAuthPage && isTokenValid && decoded) {
    const targetUrl = new URL(`/${decoded.role.toLowerCase()}`, request.url);
    return NextResponse.redirect(targetUrl);
  }

  // 2. If trying to access protected dashboard without valid session, redirect to login
  if (isProtectedPage) {
    if (!isTokenValid || !decoded) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based protection at Edge / Middleware level
    if (pathname.startsWith("/admin") && decoded.role !== "ADMIN") {
      const fallbackUrl = new URL(
        `/${decoded.role.toLowerCase()}`,
        request.url,
      );
      return NextResponse.redirect(fallbackUrl);
    }

    if (
      pathname.startsWith("/operator") &&
      decoded.role !== "OPERATOR" &&
      decoded.role !== "ADMIN"
    ) {
      const fallbackUrl = new URL(
        `/${decoded.role.toLowerCase()}`,
        request.url,
      );
      return NextResponse.redirect(fallbackUrl);
    }

    if (
      pathname.startsWith("/customer") &&
      decoded.role !== "CUSTOMER" &&
      decoded.role !== "ADMIN"
    ) {
      const fallbackUrl = new URL(
        `/${decoded.role.toLowerCase()}`,
        request.url,
      );
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/operator/:path*",
    "/customer/:path*",
    "/login",
    "/register",
    "/verify-email",
  ],
};
