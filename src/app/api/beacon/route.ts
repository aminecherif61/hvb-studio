import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { apiHandler } from "@/lib/server/guard";
import { getRequestContext } from "@/lib/server/request-context";
import { beaconSchema } from "@/lib/validation";

// Privacy-first page-view counter. The visitor hash uses a salt that changes
// daily and is derived from a server secret — visitors cannot be tracked
// across days and no raw IP or fingerprint is ever stored.
export const POST = apiHandler(async (req: Request) => {
  const parsed = beaconSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const path = parsed.data.path;
  if (path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

  const ctx = await getRequestContext();
  const day = new Date().toISOString().slice(0, 10);
  const dailySalt = createHash("sha256").update(`${env.ENCRYPTION_KEY}:${day}`).digest("hex");
  const visitorHash = createHash("sha256").update(`${dailySalt}:${ctx.ip}:${ctx.userAgent}`).digest("hex").slice(0, 32);

  await db.pageView.create({
    data: { day, path, visitorHash, country: ctx.country, device: ctx.device },
  });
  return new NextResponse(null, { status: 204 });
});
