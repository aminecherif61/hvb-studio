import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const SECRET = new TextEncoder().encode(env.AUTH_SECRET);
const ISSUER = "hvb-vault";

export const ACCESS_TTL_S = 10 * 60; // access token: 10 minutes
export const PREAUTH_TTL_S = 5 * 60; // window to complete 2FA
export const REFRESH_TTL_S = 30 * 60; // refresh token idles out after 30 min
export const SESSION_ABSOLUTE_S = 12 * 60 * 60; // hard cap per session
export const TRUSTED_DEVICE_TTL_S = 30 * 24 * 60 * 60; // 30 days

export interface AccessClaims {
  sub: string; // user id
  sid: string; // session id
  role: string;
  abs?: number; // absolute session expiry (unix seconds)
  iat0?: number; // session start (ms) — for display only
  ip?: string;
  br?: string; // browser
  os?: string;
  dv?: string; // device
}

export interface RefreshClaims extends AccessClaims {
  purpose: "refresh";
}

export interface PreAuthClaims {
  sub: string;
  purpose: "mfa";
}

async function sign(claims: Record<string, unknown>, ttlSeconds: number): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(SECRET);
}

export const signAccessToken = (c: AccessClaims) => sign({ ...c }, ACCESS_TTL_S);
export const signRefreshToken = (c: RefreshClaims) => sign({ ...c }, REFRESH_TTL_S);
export const signPreAuthToken = (c: PreAuthClaims) => sign({ ...c }, PREAUTH_TTL_S);

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: ISSUER, audience: ISSUER });
    return payload as T;
  } catch {
    return null;
  }
}
