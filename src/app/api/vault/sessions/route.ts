import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { apiHandler, requireAdmin } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { endCurrentSession } from "@/lib/server/session";

/**
 * With stateless sessions there is no server-side list to revoke from, so the
 * meaningful action is ending the session in this browser. (Rotating
 * AUTH_SECRET in the host environment invalidates every issued token.)
 */
export const DELETE = apiHandler(async () => {
  const { user } = await requireAdmin();
  const ctx = await getRequestContext();
  await endCurrentSession();
  await audit("session_revoked", ctx, { userId: user.id, detail: "signed out of this browser" });
  return NextResponse.json({ ok: true });
});
