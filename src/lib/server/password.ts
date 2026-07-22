import { argon2id, argon2Verify } from "hash-wasm";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

// Argon2id via WebAssembly (hash-wasm): identical behaviour on every runtime
// (local macOS, Linux Lambda) with no native binary to mis-bundle. Output is
// the standard PHC `$argon2id$...` string, interoperable with other Argon2
// implementations. OWASP-recommended parameters (m=19 MiB, t=2, p=1).
const PARAMS = { parallelism: 1, iterations: 2, memorySize: 19456, hashLength: 32 } as const;

export async function hashPassword(plain: string): Promise<string> {
  return argon2id({
    password: plain,
    salt: randomBytes(16),
    ...PARAMS,
    outputType: "encoded",
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2Verify({ password: plain, hash });
  } catch {
    return false;
  }
}

// Pre-computed hash of a random string, verified against when the account does
// not exist so response time does not reveal user existence.
let dummyHashPromise: Promise<string> | null = null;
export function dummyVerify(plain: string): Promise<boolean> {
  dummyHashPromise ??= hashPassword("2d1c6f0a-not-a-real-password");
  return dummyHashPromise.then((h) => argon2Verify({ password: plain, hash: h })).catch(() => false);
}

export const passwordPolicy = z
  .string()
  .min(14, "At least 14 characters")
  .max(128, "At most 128 characters")
  .refine((v) => /[a-z]/.test(v), "Add a lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Add an uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Add a number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Add a special character");

/**
 * Have I Been Pwned range check (k-anonymity: only the first 5 chars of the
 * SHA-1 leave the server). Fails open on network trouble — availability of
 * password changes must not depend on a third party.
 */
export async function isBreachedPassword(plain: string): Promise<boolean> {
  const digest = createHash("sha1").update(plain).digest("hex").toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) return false;
    const body = await res.text();
    for (const line of body.split("\n")) {
      const [suf, count] = line.trim().split(":");
      if (suf === suffix && Number(count) > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
