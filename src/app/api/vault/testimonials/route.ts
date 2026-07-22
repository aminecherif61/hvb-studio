import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { idSchema, testimonialSchema } from "@/lib/validation";

export const POST = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const count = await db.testimonial.count();
  const created = await db.testimonial.create({ data: { ...parsed.data, sort: count } });
  return NextResponse.json({ ok: true, testimonial: created });
});

export const PATCH = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z
    .object({ id: idSchema, published: z.boolean() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const updated = await db.testimonial.updateMany({
    where: { id: parsed.data.id },
    data: { published: parsed.data.published },
  });
  if (updated.count !== 1) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const deleted = await db.testimonial.deleteMany({ where: { id: parsed.data.id } });
  if (deleted.count !== 1) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});
