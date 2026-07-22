import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { randomToken, sha256 } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { sendPasswordResetMail } from "@/lib/server/mailer";
import { tooManyEvents } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { forgotSchema } from "@/lib/validation";

const RESET_TTL_MIN = 15;

// Response is identical whether or not the account exists — no enumeration.
export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = forgotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, "Invalid request");
  const { email } = parsed.data;

  const throttled =
    (await tooManyEvents("password_reset_requested", { ip: ctx.ip }, 5, 60)) ||
    (await tooManyEvents("password_reset_requested", { email }, 3, 60));

  if (!throttled) {
    await audit("password_reset_requested", ctx, { email });
    const user = await db.adminUser.findUnique({ where: { email } });
    if (user) {
      const token = randomToken();
      await db.passwordResetToken.create({
        data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MIN * 60_000) },
      });
      await sendPasswordResetMail(user.email, `${env.APP_URL}/vault/reset?token=${token}`);
    }
  }

  return NextResponse.json({ ok: true, message: "If that account exists, a reset link has been sent." });
});
