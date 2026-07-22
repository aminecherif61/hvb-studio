import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { clearCookie, COOKIE, getCookie, setCookie } from "@/lib/server/cookies";
import { decrypt, randomToken, sha256 } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { ipIsThrottled } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { createSession } from "@/lib/server/session";
import { TRUSTED_DEVICE_TTL_S, verifyToken, type PreAuthClaims } from "@/lib/server/tokens";
import { verifyTotp } from "@/lib/server/totp";
import { mfaSchema } from "@/lib/validation";

export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  if (await ipIsThrottled(ctx.ip)) throw new HttpError(429, "Too many attempts. Try again later.");

  const pre = await getCookie(COOKIE.preAuth);
  const claims = pre ? await verifyToken<PreAuthClaims>(pre) : null;
  if (!claims || claims.purpose !== "mfa") throw new HttpError(401, "Sign in again");

  const parsed = mfaSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid code");
  const { code, rememberDevice } = parsed.data;

  const user = await db.adminUser.findUnique({ where: { id: claims.sub } });
  if (!user?.totpEnabled || !user.totpSecretEnc) throw new HttpError(401, "Sign in again");

  let verified = false;
  if (/^\d{6}$/.test(code)) {
    verified = verifyTotp(decrypt(user.totpSecretEnc), code, user.email);
  } else {
    // Recovery code path — single use, consumed atomically.
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const pretty = `${normalized.slice(0, 5)}-${normalized.slice(5, 10)}`;
    const consumed = await db.recoveryCode.updateMany({
      where: { userId: user.id, codeHash: sha256(pretty), usedAt: null },
      data: { usedAt: new Date() },
    });
    verified = consumed.count === 1;
    if (verified) await audit("recovery_code_used", ctx, { email: user.email, userId: user.id });
  }

  if (!verified) {
    await audit("mfa_failure", ctx, { email: user.email, userId: user.id });
    throw new HttpError(401, "Invalid code");
  }

  await clearCookie(COOKIE.preAuth);

  if (rememberDevice) {
    const token = randomToken();
    await db.trustedDevice.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        label: `${ctx.browser} · ${ctx.os}`,
        expiresAt: new Date(Date.now() + TRUSTED_DEVICE_TTL_S * 1000),
      },
    });
    await setCookie(COOKIE.trustedDevice, token, TRUSTED_DEVICE_TTL_S);
  }

  await createSession(user, ctx);
  await audit("mfa_success", ctx, { email: user.email, userId: user.id });
  await audit("login_success", ctx, { email: user.email, userId: user.id, detail: "after 2fa" });
  return NextResponse.json({ ok: true });
});
