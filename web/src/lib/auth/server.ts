import { cookies } from "next/headers";
import { verifySessionToken } from "./session";
import { AUTH_COOKIE_NAME } from "./config";

export async function getSessionFromCookies(): Promise<{ sub: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
