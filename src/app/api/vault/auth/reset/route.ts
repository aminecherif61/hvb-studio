import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { sha256 } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { hashPassword, isBreachedPassword, passwordPolicy } from "@/lib/server/password";
import { getRequestContext } from "@/lib/server/request-context";
import { revokeAllSessions } from "@/lib/server/session";
import { resetSchema } from "@/lib/validation";

const BAD_LINK = "This reset link is invalid or has expired.";

export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = resetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, BAD_LINK);

  const policy = passwordPolicy.safeParse(parsed.data.password);
  if (!policy.success) throw new HttpError(400, policy.error.issues[0]?.message ?? "Password too weak");
  if (await isBreachedPassword(parsed.data.password)) {
    throw new HttpError(400, "That password appears in known data breaches — choose another.");
  }

  // Single use: consume atomically before doing anything else.
  const consumed = await db.passwordResetToken.updateMany({
    where: { tokenHash: sha256(parsed.data.token), usedAt: null, expiresAt: { gte: new Date() } },
    data: { usedAt: new Date() },
  });
  if (consumed.count !== 1) throw new HttpError(400, BAD_LINK);

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: sha256(parsed.data.token) },
    include: { user: true },
  });
  if (!record) throw new HttpError(400, BAD_LINK);

  await db.adminUser.update({
    where: { id: record.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      passwordChangedAt: new Date(),
      failedCount: 0,
      lockedUntil: null,
    },
  });
  await revokeAllSessions(record.userId); // every existing session must re-authenticate
  await audit("password_reset", ctx, { email: record.user.email, userId: record.userId });
  return NextResponse.json({ ok: true });
});
