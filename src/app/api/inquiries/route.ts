import { NextResponse } from "next/server";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { saveInquiry } from "@/lib/server/inquiry-store";
import { tooManyEvents } from "@/lib/server/rate-limit";
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

  if (tooManyEvents("inquiry", ctx.ip, 5, 10)) {
    throw new HttpError(429, "Too many submissions — please try again shortly");
  }

  // Log first so an inquiry is never lost, even if storage misbehaves.
  console.log(
    JSON.stringify({ level: "info", scope: "inquiry", ts: new Date().toISOString(), ...data, ip: ctx.ip }),
  );

  const stored = await saveInquiry({ ...data, ip: ctx.ip });
  if (!stored) {
    console.error(JSON.stringify({ level: "error", scope: "inquiry", msg: "no storage configured" }));
  }

  return NextResponse.json({ ok: true });
});
