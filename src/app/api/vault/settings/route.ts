import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { settingsSchema } from "@/lib/validation";

export const PUT = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  await db.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      db.setting.upsert({ where: { key }, create: { key, value }, update: { value } }),
    ),
  );
  return NextResponse.json({ ok: true });
});
