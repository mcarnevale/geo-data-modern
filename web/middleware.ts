import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isAuthConfigured } from "@/src/lib/auth/middleware";

const LOGIN_PATH = "/login";
const AUTH_API_PREFIX = "/api/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthConfigured()) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  if (pathname.startsWith(AUTH_API_PREFIX) || pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  if (pathname === LOGIN_PATH) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next({ request: { headers: request.headers } });
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico and other static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
