import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { inquirySchema } from "@/lib/validation";

/** Public booking/contact intake from the site's inquiry form. */
export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Please check the form and try again");
  const { website, ...data } = parsed.data;

  // Honeypot: pretend success, store nothing.
  if (website !== "") return NextResponse.json({ ok: true });

  const recent = await db.inquiry.count({
    where: { ip: ctx.ip, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } },
  });
  if (recent >= 5) throw new HttpError(429, "Too many submissions — please try again shortly");

  await db.inquiry.create({ data: { ...data, ip: ctx.ip } });
  return NextResponse.json({ ok: true });
});
