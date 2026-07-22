import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { deleteStored, processUpload } from "@/lib/server/uploads";
import { idSchema } from "@/lib/validation";

export const POST = apiHandler(async (req: Request) => {
  await requireAdmin();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No image provided");
  const alt = z.string().max(300).catch("").parse(form?.get("alt") ?? "");

  const stored = await processUpload(file);
  const asset = await db.mediaAsset.create({ data: { ...stored, alt } });
  return NextResponse.json({ ok: true, asset });
});

export const PATCH = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z
    .object({ id: idSchema, alt: z.string().trim().max(300) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const updated = await db.mediaAsset.updateMany({ where: { id: parsed.data.id }, data: { alt: parsed.data.alt } });
  if (updated.count !== 1) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const asset = await db.mediaAsset.findUnique({ where: { id: parsed.data.id } });
  if (!asset) throw new HttpError(404, "Not found");
  await db.mediaAsset.delete({ where: { id: asset.id } });
  await deleteStored([asset.fileName, asset.thumbName]);
  return NextResponse.json({ ok: true });
});
