import type { AdminUser, Session } from "@prisma/client";
import { COOKIE, clearAuthCookies, getCookie, setCookie } from "./cookies";
import { randomToken, sha256 } from "./crypto";
import { db } from "./db";
import type { RequestContext } from "./request-context";
import {
  ACCESS_TTL_S,
  REFRESH_TTL_S,
  SESSION_ABSOLUTE_S,
  signAccessToken,
  verifyToken,
  type AccessClaims,
} from "./tokens";

/** Create a session and issue access + refresh cookies. */
export async function createSession(user: AdminUser, ctx: RequestContext): Promise<Session> {
  const refreshToken = randomToken();
  const session = await db.session.create({
    data: {
      userId: user.id,
      absoluteExpiresAt: new Date(Date.now() + SESSION_ABSOLUTE_S * 1000),
      ip: ctx.ip,
      browser: ctx.browser,
      os: ctx.os,
      device: ctx.device,
      tokens: {
        create: { tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_S * 1000) },
      },
    },
  });
  await setCookie(COOKIE.access, await signAccessToken({ sub: user.id, sid: session.id, role: user.role }), ACCESS_TTL_S);
  await setCookie(COOKIE.refresh, refreshToken, REFRESH_TTL_S);
  return session;
}

/**
 * Rotate the refresh token. A token that was already used is treated as
 * stolen: the entire session is revoked (classic rotation-family defense).
 * Returns the fresh access claims or null when re-authentication is needed.
 */
export async function rotateSession(): Promise<AccessClaims | null> {
  const presented = await getCookie(COOKIE.refresh);
  if (!presented) return null;

  const record = await db.sessionToken.findUnique({
    where: { tokenHash: sha256(presented) },
    include: { session: { include: { user: true } } },
  });
  if (!record) return null;

  const { session } = record;
  const now = Date.now();

  if (record.usedAt) {
    // Within a short grace window a re-presented token is a benign race
    // (parallel tabs refreshing together): issue a fresh access token and
    // leave the winner's rotation untouched. Outside it, this is replay of
    // a stolen token — kill the whole session.
    const GRACE_MS = 10_000;
    if (!session.revokedAt && now - record.usedAt.getTime() < GRACE_MS) {
      const claims: AccessClaims = { sub: session.userId, sid: session.id, role: session.user.role };
      await setCookie(COOKIE.access, await signAccessToken(claims), ACCESS_TTL_S);
      return claims;
    }
    await db.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return null;
  }
  if (
    session.revokedAt ||
    record.expiresAt.getTime() < now ||
    session.absoluteExpiresAt.getTime() < now ||
    session.lastActiveAt.getTime() + REFRESH_TTL_S * 1000 < now
  ) {
    return null;
  }

  const nextToken = randomToken();
  await db.$transaction([
    db.sessionToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.sessionToken.create({
      data: { sessionId: session.id, tokenHash: sha256(nextToken), expiresAt: new Date(now + REFRESH_TTL_S * 1000) },
    }),
    db.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } }),
  ]);

  const claims: AccessClaims = { sub: session.userId, sid: session.id, role: session.user.role };
  await setCookie(COOKIE.access, await signAccessToken(claims), ACCESS_TTL_S);
  await setCookie(COOKIE.refresh, nextToken, REFRESH_TTL_S);
  return claims;
}

export interface AuthedAdmin {
  user: AdminUser;
  session: Session;
}

/**
 * Full authentication check for server components and route handlers:
 * verifies the JWT, then confirms the session row is live (not revoked,
 * within idle + absolute windows). Backend is the source of truth — a valid
 * signature alone is never enough.
 */
export async function getAuthedAdmin(): Promise<AuthedAdmin | null> {
  const token = await getCookie(COOKIE.access);
  if (!token) return null;
  const claims = await verifyToken<AccessClaims>(token);
  if (!claims || claims.role !== "admin") return null;

  const session = await db.session.findUnique({ where: { id: claims.sid }, include: { user: true } });
  if (!session || session.revokedAt) return null;

  const now = Date.now();
  if (session.absoluteExpiresAt.getTime() < now) return null;
  if (session.lastActiveAt.getTime() + REFRESH_TTL_S * 1000 < now) return null;
  if (session.user.id !== claims.sub || session.user.role !== "admin") return null;

  // Sliding activity window; throttled to one write per minute.
  if (now - session.lastActiveAt.getTime() > 60_000) {
    await db.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } });
  }
  const { user, ...rest } = session;
  return { user, session: rest as Session };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db.session.updateMany({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await db.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function endCurrentSession(): Promise<string | null> {
  const token = await getCookie(COOKIE.access);
  const claims = token ? await verifyToken<AccessClaims>(token) : null;
  if (claims) await revokeSession(claims.sid);
  await clearAuthCookies();
  return claims?.sub ?? null;
}
