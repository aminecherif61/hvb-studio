import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { clearCookie, COOKIE } from "@/lib/server/cookies";
import { decrypt, encrypt, sha256 } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { verifyPassword } from "@/lib/server/password";
import { getRequestContext } from "@/lib/server/request-context";
import { generateRecoveryCodes, generateTotpSecret, totpQrDataUrl, verifyTotp } from "@/lib/server/totp";

/** Begin setup: provision a pending secret and return the QR to scan. */
export const POST = apiHandler(async () => {
  const { user } = await requireAdmin();
  if (user.totpEnabled) throw new HttpError(400, "Two-factor is already enabled");

  const secret = generateTotpSecret();
  await db.adminUser.update({ where: { id: user.id }, data: { totpSecretEnc: encrypt(secret), totpEnabled: false } });
  const { uri, qr } = await totpQrDataUrl(secret, user.email);
  return NextResponse.json({ qr, uri, secret });
});

/** Confirm setup with a live code; returns single-view recovery codes. */
export const PUT = apiHandler(async (req: Request) => {
  const { user } = await requireAdmin();
  const ctx = await getRequestContext();
  const parsed = z.object({ code: z.string().trim() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid code");
  if (user.totpEnabled || !user.totpSecretEnc) throw new HttpError(400, "Start setup first");

  if (!verifyTotp(decrypt(user.totpSecretEnc), parsed.data.code, user.email)) {
    throw new HttpError(401, "Invalid code");
  }

  const codes = generateRecoveryCodes();
  await db.$transaction([
    db.recoveryCode.deleteMany({ where: { userId: user.id } }),
    db.recoveryCode.createMany({ data: codes.map((c) => ({ userId: user.id, codeHash: sha256(c) })) }),
    db.adminUser.update({ where: { id: user.id }, data: { totpEnabled: true } }),
  ]);
  await audit("twofa_enabled", ctx, { email: user.email, userId: user.id });
  return NextResponse.json({ ok: true, recoveryCodes: codes });
});

/** Disable — requires the current password, removes trusted devices. */
export const DELETE = apiHandler(async (req: Request) => {
  const { user } = await requireAdmin();
  const ctx = await getRequestContext();
  const parsed = z.object({ password: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
    throw new HttpError(401, "Invalid credentials");
  }

  await db.$transaction([
    db.adminUser.update({ where: { id: user.id }, data: { totpEnabled: false, totpSecretEnc: null } }),
    db.recoveryCode.deleteMany({ where: { userId: user.id } }),
    db.trustedDevice.deleteMany({ where: { userId: user.id } }),
  ]);
  await clearCookie(COOKIE.trustedDevice);
  await audit("twofa_disabled", ctx, { email: user.email, userId: user.id });
  return NextResponse.json({ ok: true });
});
