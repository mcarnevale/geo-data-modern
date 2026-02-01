/**
 * Auth verification for middleware (Edge-compatible).
 * Verifies JWT without throwing if config is missing.
 */
import * as jose from "jose";

const AUTH_COOKIE_NAME = "geo_session";

export async function getSessionFromRequest(
  request: Request
): Promise<{ sub: string } | null> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    return null;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v ?? ""];
    })
  );

  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.sub ? { sub: payload.sub as string } : null;
  } catch {
    return null;
  }
}

export function isAuthConfigured(): boolean {
  return !!(
    process.env.AUTH_USERNAME &&
    process.env.AUTH_PASSWORD_HASH &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32
  );
}
