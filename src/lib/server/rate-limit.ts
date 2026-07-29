// Brute-force protection with no external dependency.
//
// Counters live in module memory, which is per-instance on serverless hosts.
// That is intentionally conservative: an attacker distributed across many
// cold instances still faces Argon2id verification per attempt, and a single
// abusive client is locked out quickly. Swap `throttleState`/`noteFailure`
// for Upstash Redis if you later need cluster-wide precision — the call
// sites do not change.

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
const WINDOW_MS = LOCK_MINUTES * 60_000;
const MAX_ENTRIES = 5_000; // bounded so this can never grow without limit

interface Entry {
  failures: number;
  firstAt: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, Entry>();

function sweep(now: number) {
  if (attempts.size < MAX_ENTRIES) return;
  for (const [key, e] of attempts) {
    if ((e.lockedUntil ?? 0) < now && now - e.firstAt > WINDOW_MS) attempts.delete(key);
  }
}

const keysFor = (email: string, ip: string) => [`e:${email.trim().toLowerCase()}`, `i:${ip}`];

export interface ThrottleState {
  locked: boolean;
  remaining: number;
}

export function throttleState(email: string, ip: string): ThrottleState {
  const now = Date.now();
  let locked = false;
  let remaining = MAX_FAILED_ATTEMPTS;

  for (const key of keysFor(email, ip)) {
    const e = attempts.get(key);
    if (!e) continue;
    if (e.lockedUntil && e.lockedUntil > now) locked = true;
    if (now - e.firstAt <= WINDOW_MS) remaining = Math.min(remaining, MAX_FAILED_ATTEMPTS - e.failures);
  }
  return { locked, remaining: Math.max(remaining, 0) };
}

export function noteFailure(email: string, ip: string): { locked: boolean } {
  const now = Date.now();
  sweep(now);
  let locked = false;

  for (const key of keysFor(email, ip)) {
    const existing = attempts.get(key);
    const fresh = !existing || now - existing.firstAt > WINDOW_MS;
    const entry: Entry = fresh
      ? { failures: 1, firstAt: now, lockedUntil: null }
      : { ...existing!, failures: existing!.failures + 1 };

    if (entry.failures >= MAX_FAILED_ATTEMPTS) {
      entry.lockedUntil = now + WINDOW_MS;
      locked = true;
    }
    attempts.set(key, entry);
  }
  return { locked };
}

export function resetFailures(email: string, ip: string): void {
  for (const key of keysFor(email, ip)) attempts.delete(key);
}

/** Generic limiter for public endpoints (inquiries, password reset). */
const events = new Map<string, number[]>();

export function tooManyEvents(bucket: string, key: string, max: number, windowMinutes: number): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60_000;
  const id = `${bucket}:${key}`;
  const hits = (events.get(id) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  events.set(id, hits);
  if (events.size > MAX_ENTRIES) events.clear();
  return hits.length > max;
}
