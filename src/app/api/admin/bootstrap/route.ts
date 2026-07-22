import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/server/password";
import { safeEqual } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { apiHandler, HttpError } from "@/lib/server/guard";
import { INIT_STATEMENTS } from "@/lib/server/init-sql";

/**
 * One-time database bootstrap for hosts (Netlify) where the Postgres URL only
 * exists at runtime, not during the local build. Creates the schema if absent
 * and the first admin if absent — fully idempotent, so a second call is inert.
 * Authorized by BOOTSTRAP_SECRET (constant-time compared). Safe to leave
 * deployed: once the admin exists it does nothing.
 */
export const POST = apiHandler(async (req: Request) => {
  const secret = process.env.BOOTSTRAP_SECRET;
  const provided = req.headers.get("x-bootstrap-secret") ?? "";
  if (!secret || !safeEqual(provided, secret)) {
    throw new HttpError(403, "Forbidden");
  }

  // Since the caller is authorized, surface real diagnostics on failure.
  try {
    const [{ present }] = await db.$queryRawUnsafe<{ present: boolean }[]>(
      `SELECT to_regclass('public."AdminUser"') IS NOT NULL AS present`,
    );
    let schemaCreated = false;
    if (!present) {
      for (const statement of INIT_STATEMENTS) {
        await db.$executeRawUnsafe(statement);
      }
      schemaCreated = true;
    }

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_INITIAL_PASSWORD;
    if (!email || !password) throw new Error("ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD not set");

    let adminCreated = false;
    const existing = await db.adminUser.findUnique({ where: { email } });
    if (!existing) {
      await db.adminUser.create({
        data: { email, passwordHash: await hashPassword(password), role: "admin" },
      });
      adminCreated = true;
    }
    return NextResponse.json({ ok: true, schemaCreated, adminCreated });
  } catch (err) {
    // Authorized caller only — surface the DB error message to help setup.
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
});
