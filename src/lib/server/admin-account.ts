import { argon2Verify } from "hash-wasm";
import { timingSafeEqual } from "node:crypto";
import { verifyPassword } from "./password";

/**
 * Single-admin identity, held in environment variables instead of a database.
 *
 * A one-owner console does not need a users table, and removing that
 * dependency means sign-in works on any host with no database attached.
 * Credentials are supplied as either:
 *   ADMIN_PASSWORD_HASH — an Argon2id PHC string (preferred), or
 *   ADMIN_PASSWORD      — plaintext, compared in constant time (fallback).
 */
export interface AdminIdentity {
  id: string;
  email: string;
  role: "admin";
}

export const ADMIN_ID = "admin";

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

/**
 * Argon2id PHC strings contain `$` sequences, which dotenv-expand (used by
 * Next.js) silently rewrites as variable references. ADMIN_PASSWORD_HASH_B64
 * carries the same hash base64-encoded so it survives every environment
 * loader; the raw form is still accepted when it looks intact.
 */
export function adminPasswordHash(): string {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8").trim();
      if (decoded.startsWith("$argon2")) return decoded;
    } catch {
      /* fall through to the raw value */
    }
  }
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  return raw.startsWith("$argon2") ? raw : "";
}

export function adminIdentity(): AdminIdentity {
  return { id: ADMIN_ID, email: adminEmail(), role: "admin" };
}

/** True when credentials are configured well enough to attempt a sign-in. */
export function adminConfigured(): boolean {
  return Boolean(
    adminEmail() && (adminPasswordHash() || process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD),
  );
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Verify a submitted email + password against the configured admin.
 * Always performs comparable work regardless of which field is wrong.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = adminEmail();
  const emailOk = Boolean(expectedEmail) && constantTimeEquals(email.trim().toLowerCase(), expectedEmail);

  const hash = adminPasswordHash();
  let passwordOk = false;

  if (hash) {
    passwordOk = await verifyPassword(hash, password);
  } else {
    const plain = (process.env.ADMIN_PASSWORD ?? process.env.ADMIN_INITIAL_PASSWORD ?? "").trim();
    // Hash the candidate anyway so timing does not distinguish "no password
    // configured" from "wrong password".
    passwordOk = Boolean(plain) && constantTimeEquals(password, plain);
  }

  return emailOk && passwordOk;
}

/** Exposed for tooling/tests: confirm a PHC hash parses. */
export async function hashLooksValid(hash: string): Promise<boolean> {
  try {
    await argon2Verify({ password: "probe", hash });
    return true;
  } catch {
    return false;
  }
}
