/**
 * Auth configuration. Credentials and secrets must come from environment variables.
 * Never commit AUTH_PASSWORD_HASH or SESSION_SECRET to version control.
 */
export const AUTH_COOKIE_NAME = "geo_session";
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export function getAuthConfig() {
  const username = process.env.AUTH_USERNAME;
  const passwordHashRaw = process.env.AUTH_PASSWORD_HASH;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!username || !passwordHashRaw || !sessionSecret) {
    throw new Error(
      "Missing AUTH_USERNAME, AUTH_PASSWORD_HASH, or SESSION_SECRET in environment"
    );
  }

  if (sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }

  // Support base64-encoded hash (avoids $ expansion in .env) or raw bcrypt hash
  const passwordHash =
    passwordHashRaw.startsWith("$2")
      ? passwordHashRaw
      : Buffer.from(passwordHashRaw, "base64").toString("utf8");

  return { username, passwordHash, sessionSecret };
}
