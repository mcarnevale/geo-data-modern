import * as jose from "jose";
import { getAuthConfig } from "./config";

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

export async function createSessionToken(username: string): Promise<string> {
  const { sessionSecret } = getAuthConfig();
  const secret = new TextEncoder().encode(sessionSecret);

  return await new jose.SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { sessionSecret } = getAuthConfig();
    const secret = new TextEncoder().encode(sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}
