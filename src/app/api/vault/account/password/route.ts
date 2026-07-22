import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { hashPassword, isBreachedPassword, passwordPolicy, verifyPassword } from "@/lib/server/password";
import { getRequestContext } from "@/lib/server/request-context";
import { changePasswordSchema } from "@/lib/validation";

export const PUT = apiHandler(async (req: Request) => {
  const { user, session } = await requireAdmin();
  const ctx = await getRequestContext();
  const parsed = changePasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) {
    await audit("login_failure", ctx, { email: user.email, userId: user.id, detail: "password change: wrong current password" });
    throw new HttpError(401, "Invalid credentials");
  }

  const policy = passwordPolicy.safeParse(parsed.data.newPassword);
  if (!policy.success) throw new HttpError(400, policy.error.issues[0]?.message ?? "Password too weak");
  if (await isBreachedPassword(parsed.data.newPassword)) {
    throw new HttpError(400, "That password appears in known data breaches — choose another.");
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), passwordChangedAt: new Date() },
  });
  // Sign out every other session; the current one continues.
  await db.session.updateMany({
    where: { userId: user.id, revokedAt: null, id: { not: session.id } },
    data: { revokedAt: new Date() },
  });
  await audit("password_changed", ctx, { email: user.email, userId: user.id });
  return NextResponse.json({ ok: true });
});
