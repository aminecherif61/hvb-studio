import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { tooManyEvents } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { forgotSchema } from "@/lib/validation";

/**
 * The admin password lives in an environment variable, so it is rotated by
 * the owner in the hosting dashboard rather than by an emailed link. The
 * response stays deliberately generic (no account enumeration) and the
 * request is still logged and rate limited.
 */
export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = forgotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");

  if (!tooManyEvents("forgot", ctx.ip, 5, 60)) {
    await audit("password_reset_requested", ctx, { email: parsed.data.email });
  }

  return NextResponse.json({
    ok: true,
    message: "If that account exists, a reset link has been sent.",
  });
});
