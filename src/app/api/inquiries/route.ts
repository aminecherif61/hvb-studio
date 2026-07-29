import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { tooManyEvents } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { databaseConfigured } from "@/lib/server/safe-db";
import { inquirySchema } from "@/lib/validation";

/** Public booking/contact intake from the site's inquiry form. */
export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Please check the form and try again");
  const { website, ...data } = parsed.data;

  // Honeypot: pretend success, store nothing.
  if (website !== "") return NextResponse.json({ ok: true });

  if (tooManyEvents("inquiry", ctx.ip, 5, 10)) {
    throw new HttpError(429, "Too many submissions — please try again shortly");
  }

  // Always emit the inquiry to the server log so it is never lost, even if
  // the database is unavailable; platform log drains capture it.
  console.log(
    JSON.stringify({ level: "info", scope: "inquiry", ts: new Date().toISOString(), ...data, ip: ctx.ip }),
  );

  if (databaseConfigured()) {
    try {
      await db.inquiry.create({ data: { ...data, ip: ctx.ip } });
    } catch (err) {
      console.error(JSON.stringify({ level: "error", scope: "inquiry", msg: "store failed", err: String(err) }));
    }
  }

  return NextResponse.json({ ok: true });
});
