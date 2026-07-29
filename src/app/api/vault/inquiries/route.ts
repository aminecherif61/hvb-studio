import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";
import { deleteInquiry, setInquiryStatus } from "@/lib/server/inquiry-store";

const idSchema = z.string().min(6).max(64).regex(/^[a-z0-9]+$/i);

export const PATCH = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z
    .object({ id: idSchema, status: z.enum(["new", "replied", "archived"]) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  const ok = await setInquiryStatus(parsed.data.id, parsed.data.status);
  if (!ok) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  const ok = await deleteInquiry(parsed.data.id);
  if (!ok) throw new HttpError(404, "Not found");
  return NextResponse.json({ ok: true });
});
