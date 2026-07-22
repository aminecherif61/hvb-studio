import { db } from "./db";
import type { RequestContext } from "./request-context";

export type AuditType =
  | "login_success"
  | "login_failure"
  | "lockout"
  | "mfa_success"
  | "mfa_failure"
  | "logout"
  | "refresh_reuse"
  | "password_reset_requested"
  | "password_reset"
  | "password_changed"
  | "twofa_enabled"
  | "twofa_disabled"
  | "session_revoked"
  | "recovery_code_used";

/**
 * Structured security log. Also mirrored to stdout as JSON so platform log
 * drains (Netlify, Datadog, …) capture events even if the DB write fails.
 */
export async function audit(
  type: AuditType,
  ctx: RequestContext,
  extra: { email?: string; userId?: string; detail?: string } = {},
): Promise<void> {
  const entry = {
    type,
    email: extra.email ?? null,
    userId: extra.userId ?? null,
    detail: extra.detail ?? null,
    ip: ctx.ip,
    country: ctx.country,
    browser: ctx.browser,
    os: ctx.os,
    device: ctx.device,
    userAgent: ctx.userAgent,
  };
  console.log(JSON.stringify({ level: "info", scope: "vault.audit", ts: new Date().toISOString(), ...entry }));
  try {
    await db.auditLog.create({ data: entry });
  } catch (err) {
    console.error(JSON.stringify({ level: "error", scope: "vault.audit", msg: "audit write failed", err: String(err) }));
  }
}
