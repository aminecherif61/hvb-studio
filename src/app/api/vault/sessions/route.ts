import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { idSchema } from "@/lib/validation";

/** Revoke one session (or all others) belonging to the signed-in admin. */
export const DELETE = apiHandler(async (req: Request) => {
  const { user, session } = await requireAdmin();
  const ctx = await getRequestContext();
  const parsed = z
    .object({ id: idSchema.optional(), allOthers: z.boolean().optional().default(false) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  if (parsed.data.allOthers) {
    await db.session.updateMany({
      where: { userId: user.id, revokedAt: null, id: { not: session.id } },
      data: { revokedAt: new Date() },
    });
    await audit("session_revoked", ctx, { userId: user.id, detail: "all other sessions" });
    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.id) throw new HttpError(400, "Invalid request");
  const updated = await db.session.updateMany({
    where: { id: parsed.data.id, userId: user.id }, // ownership enforced in the query
    data: { revokedAt: new Date() },
  });
  if (updated.count !== 1) throw new HttpError(404, "Session not found");
  await audit("session_revoked", ctx, { userId: user.id, detail: parsed.data.id });
  return NextResponse.json({ ok: true });
});
