import { NextResponse } from "next/server";
import { adminConfigured, adminEmail, verifyAdminCredentials } from "@/lib/server/admin-account";
import { audit } from "@/lib/server/audit";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { noteFailure, resetFailures, throttleState } from "@/lib/server/rate-limit";
import { getRequestContext } from "@/lib/server/request-context";
import { createSession } from "@/lib/server/session";
import { loginSchema } from "@/lib/validation";

const INVALID = "Invalid credentials";
const LOCKED = "Too many failed attempts. Try again later.";

export const POST = apiHandler(async (req: Request) => {
  const ctx = await getRequestContext();
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, INVALID);
  const { email, password, website } = parsed.data;

  // Bots that fill the honeypot get a generic failure with no side effects.
  if (website !== "") throw new HttpError(401, INVALID);

  if (!adminConfigured()) {
    console.error("[auth] ADMIN_EMAIL / ADMIN_PASSWORD(_HASH) are not configured");
    throw new HttpError(401, INVALID);
  }

  // Brute-force guard: 5 failures per identifier, then a 15-minute lock.
  const throttle = throttleState(email, ctx.ip);
  if (throttle.locked) {
    await audit("login_failure", ctx, { email, detail: "locked out" });
    throw new HttpError(429, LOCKED);
  }

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) {
    const state = noteFailure(email, ctx.ip);
    await audit(state.locked ? "lockout" : "login_failure", ctx, {
      email,
      detail: state.locked ? "locked after repeated failures" : "bad credentials",
    });
    throw new HttpError(state.locked ? 429 : 401, state.locked ? LOCKED : INVALID);
  }

  resetFailures(email, ctx.ip);
  await createSession(null, ctx);
  await audit("login_success", ctx, { email: adminEmail(), userId: "admin" });
  return NextResponse.json({ ok: true });
});
