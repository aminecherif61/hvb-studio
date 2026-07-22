import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { idSchema } from "@/lib/validation";

/** Forget a trusted device — its browser must pass 2FA again. */
export const DELETE = apiHandler(async (req: Request) => {
  const { user } = await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  const deleted = await db.trustedDevice.deleteMany({ where: { id: parsed.data.id, userId: user.id } });
  if (deleted.count !== 1) throw new HttpError(404, "Device not found");
  return NextResponse.json({ ok: true });
});
