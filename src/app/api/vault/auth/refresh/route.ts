import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { clearAuthCookies } from "@/lib/server/cookies";
import { apiHandler } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { rotateSession } from "@/lib/server/session";

export const POST = apiHandler(async () => {
  const claims = await rotateSession();
  if (!claims) {
    const ctx = await getRequestContext();
    await audit("refresh_reuse", ctx, { detail: "refresh rejected (expired, revoked or replayed)" });
    await clearAuthCookies();
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
});
