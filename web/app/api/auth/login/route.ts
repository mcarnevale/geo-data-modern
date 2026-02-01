import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthConfig } from "@/src/lib/auth/config";
import { createSessionToken } from "@/src/lib/auth/session";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/src/lib/auth/config";

export async function POST(request: Request) {
  let authConfig: { username: string; passwordHash: string };
  try {
    authConfig = getAuthConfig();
  } catch {
    return NextResponse.json(
      { error: "Auth not configured" },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username: inputUsername, password: inputPassword } = body;
  if (!inputUsername || !inputPassword) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const { username, passwordHash } = authConfig;

  const usernameMatch = inputUsername.trim().toLowerCase() === username.toLowerCase();
  const passwordMatch = await bcrypt.compare(inputPassword, passwordHash);

  if (!usernameMatch || !passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  return response;
}
