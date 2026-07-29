import { adminIdentity, ADMIN_ID, type AdminIdentity } from "./admin-account";
import { COOKIE, clearAuthCookies, getCookie, setCookie } from "./cookies";
import { randomToken } from "./crypto";
import type { RequestContext } from "./request-context";
import {
  ACCESS_TTL_S,
  REFRESH_TTL_S,
  SESSION_ABSOLUTE_S,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type AccessClaims,
  type RefreshClaims,
} from "./tokens";

/**
 * Stateless sessions.
 *
 * Both the access and refresh tokens are signed JWTs held in HttpOnly,
 * Secure, SameSite=Strict cookies — no session table, so sign-in works with
 * no database attached. Security properties that remain: short-lived access
 * tokens (10 min), refresh rotation on every use, an absolute session cap
 * (12 h) carried inside the token, and signature+expiry verification on every
 * request. Trade-off: server-side revocation of a single session is not
 * possible without shared state; rotating AUTH_SECRET invalidates everything
 * immediately, and the idle/absolute windows bound exposure.
 */

export interface SessionInfo {
  id: string;
  createdAt: Date;
  lastActiveAt: Date;
  absoluteExpiresAt: Date;
  ip: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
}

export interface AuthedAdmin {
  user: AdminIdentity & { totpEnabled: boolean };
  session: SessionInfo;
}

function sessionFromClaims(claims: AccessClaims): SessionInfo {
  return {
    id: claims.sid,
    createdAt: new Date(claims.iat0 ?? Date.now()),
    lastActiveAt: new Date(),
    absoluteExpiresAt: new Date((claims.abs ?? Math.floor(Date.now() / 1000) + SESSION_ABSOLUTE_S) * 1000),
    ip: claims.ip ?? null,
    browser: claims.br ?? null,
    os: claims.os ?? null,
    device: claims.dv ?? null,
  };
}

/** Issue access + refresh cookies for a fresh sign-in. */
export async function createSession(_user: unknown, ctx: RequestContext): Promise<SessionInfo> {
  const sid = randomToken(12);
  const nowS = Math.floor(Date.now() / 1000);
  const abs = nowS + SESSION_ABSOLUTE_S;
  const base = {
    sub: ADMIN_ID,
    sid,
    role: "admin" as const,
    abs,
    iat0: Date.now(),
    ip: ctx.ip,
    br: ctx.browser,
    os: ctx.os,
    dv: ctx.device,
  };

  await setCookie(COOKIE.access, await signAccessToken(base), ACCESS_TTL_S);
  await setCookie(COOKIE.refresh, await signRefreshToken({ ...base, purpose: "refresh" }), REFRESH_TTL_S);

  return sessionFromClaims(base as AccessClaims);
}

/**
 * Rotate the refresh token and mint a new access token. Returns null when the
 * refresh token is missing, invalid, expired, or past the absolute cap — in
 * which case the caller must re-authenticate.
 */
export async function rotateSession(): Promise<AccessClaims | null> {
  const presented = await getCookie(COOKIE.refresh);
  if (!presented) return null;

  const claims = await verifyToken<RefreshClaims>(presented);
  if (!claims || claims.purpose !== "refresh" || claims.role !== "admin") return null;

  const nowS = Math.floor(Date.now() / 1000);
  if (claims.abs && claims.abs < nowS) return null; // absolute session cap reached

  const next: AccessClaims = {
    sub: claims.sub,
    sid: claims.sid,
    role: "admin",
    abs: claims.abs,
    iat0: claims.iat0,
    ip: claims.ip,
    br: claims.br,
    os: claims.os,
    dv: claims.dv,
  };

  await setCookie(COOKIE.access, await signAccessToken(next), ACCESS_TTL_S);
  await setCookie(COOKIE.refresh, await signRefreshToken({ ...next, purpose: "refresh" }), REFRESH_TTL_S);
  return next;
}

/**
 * Full authentication check for server components and route handlers:
 * verifies the signed access token and the absolute session cap.
 */
export async function getAuthedAdmin(): Promise<AuthedAdmin | null> {
  const token = await getCookie(COOKIE.access);
  if (!token) return null;

  const claims = await verifyToken<AccessClaims>(token);
  if (!claims || claims.role !== "admin" || claims.sub !== ADMIN_ID) return null;

  const nowS = Math.floor(Date.now() / 1000);
  if (claims.abs && claims.abs < nowS) return null;

  return {
    user: { ...adminIdentity(), totpEnabled: false },
    session: sessionFromClaims(claims),
  };
}

/** Sign out: clearing the cookies ends the session for this browser. */
export async function endCurrentSession(): Promise<string | null> {
  const token = await getCookie(COOKIE.access);
  const claims = token ? await verifyToken<AccessClaims>(token) : null;
  await clearAuthCookies();
  return claims?.sub ?? null;
}

// Kept for API compatibility with callers; without shared state the only
// meaningful revocation is clearing this browser's cookies (or rotating
// AUTH_SECRET, which invalidates every issued token everywhere).
export async function revokeSession(_sessionId: string): Promise<void> {
  await clearAuthCookies();
}

export async function revokeAllSessions(_userId: string): Promise<void> {
  await clearAuthCookies();
}
