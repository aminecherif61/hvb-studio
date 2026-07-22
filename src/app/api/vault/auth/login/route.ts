import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { COOKIE, getCookie, setCookie } from "@/lib/server/cookies";
import { sha256 } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { dummyVerify, verifyPassword } from "@/lib/server/password";
import { ipIsThrottled, LOCK_MINUTES, MAX_FAILED_ATTEMPTS } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { createSession } from "@/lib/server/session";
import { PREAUTH_TTL_S, signPreAuthToken } from "@/lib/server/tokens";
import { loginSchema } from "@/lib/validation";

const INVALID = "Invalid credentials";
const LOCKED = "Too many failed attempts. Try again later.";

export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, INVALID);
  const { email, password, website } = parsed.data;

  // Bots that fill the honeypot get a generic failure with no side effects.
  if (website !== "") throw new HttpError(401, INVALID);

  if (await ipIsThrottled(ctx.ip)) {
    throw new HttpError(429, LOCKED);
  }

  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) {
    await dummyVerify(password); // equalize timing with the real-hash path
    await audit("login_failure", ctx, { email, detail: "unknown account" });
    throw new HttpError(401, INVALID);
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    await audit("login_failure", ctx, { email, userId: user.id, detail: "account locked" });
    throw new HttpError(429, LOCKED);
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) {
    const failedCount = user.failedCount + 1;
    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      await db.adminUser.update({
        where: { id: user.id },
        data: { failedCount: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) },
      });
      await audit("lockout", ctx, { email, userId: user.id, detail: `locked ${LOCK_MINUTES}m after ${failedCount} failures` });
      throw new HttpError(429, LOCKED);
    }
    await db.adminUser.update({ where: { id: user.id }, data: { failedCount } });
    await audit("login_failure", ctx, { email, userId: user.id, detail: "wrong password" });
    throw new HttpError(401, INVALID);
  }

  if (user.failedCount > 0 || user.lockedUntil) {
    await db.adminUser.update({ where: { id: user.id }, data: { failedCount: 0, lockedUntil: null } });
  }

  if (user.totpEnabled) {
    // A valid trusted-device cookie (30 days) skips the TOTP step.
    const deviceToken = await getCookie(COOKIE.trustedDevice);
    const trusted = deviceToken
      ? await db.trustedDevice.findUnique({ where: { tokenHash: sha256(deviceToken) } })
      : null;
    const trustedValid = trusted && trusted.userId === user.id && trusted.expiresAt.getTime() > Date.now();

    if (!trustedValid) {
      await setCookie(COOKIE.preAuth, await signPreAuthToken({ sub: user.id, purpose: "mfa" }), PREAUTH_TTL_S);
      return NextResponse.json({ mfaRequired: true });
    }
    await db.trustedDevice.update({ where: { id: trusted.id }, data: { lastUsedAt: new Date() } });
  }

  await createSession(user, ctx);
  await audit("login_success", ctx, { email, userId: user.id });
  return NextResponse.json({ ok: true });
});
