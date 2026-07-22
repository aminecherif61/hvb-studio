import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { idSchema, inquiryUpdateSchema } from "@/lib/validation";

export const PATCH = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = inquiryUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const updated = await db.inquiry.updateMany({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  if (updated.count !== 1) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const deleted = await db.inquiry.deleteMany({ where: { id: parsed.data.id } });
  if (deleted.count !== 1) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});
