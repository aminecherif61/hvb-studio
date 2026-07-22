import { db } from "./db";

// Durable, DB-backed limits — correct across serverless instances without
// extra infrastructure. For very high traffic swap the counting queries for
// Upstash Redis; the call sites stay identical.

export const MAX_FAILED_ATTEMPTS = 5; // per account, then 15 min lock
export const LOCK_MINUTES = 15;
const IP_WINDOW_MINUTES = 15;
const IP_MAX_FAILURES = 20; // per IP across all accounts

const since = (minutes: number) => new Date(Date.now() - minutes * 60_000);

/** True when this IP has burned through the shared failure budget. */
export async function ipIsThrottled(ip: string): Promise<boolean> {
  if (ip === "unknown") return false;
  const count = await db.auditLog.count({
    where: { type: { in: ["login_failure", "mfa_failure"] }, ip, createdAt: { gte: since(IP_WINDOW_MINUTES) } },
  });
  return count >= IP_MAX_FAILURES;
}

/** Generic per-key limiter for public endpoints (forgot-password, inquiries). */
export async function tooManyEvents(
  type: string,
  key: { ip?: string; email?: string },
  max: number,
  windowMinutes: number,
): Promise<boolean> {
  const count = await db.auditLog.count({
    where: {
      type,
      ...(key.ip ? { ip: key.ip } : {}),
      ...(key.email ? { email: key.email } : {}),
      createdAt: { gte: since(windowMinutes) },
    },
  });
  return count >= max;
}
