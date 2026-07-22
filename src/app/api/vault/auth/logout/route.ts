import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import { apiHandler } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { endCurrentSession } from "@/lib/server/session";

export const POST = apiHandler(async () => {
  const ctx = await getRequestContext();
  const userId = await endCurrentSession();
  if (userId) await audit("logout", ctx, { userId });
  return NextResponse.json({ ok: true });
});
