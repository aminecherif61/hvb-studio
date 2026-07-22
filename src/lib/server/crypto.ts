import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "./env";

const KEY = Buffer.from(env.ENCRYPTION_KEY, "base64");

/** URL-safe random token (default 256 bits of entropy). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Tokens are stored only as SHA-256 digests; a DB leak reveals nothing usable. */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** AES-256-GCM for secrets at rest (TOTP seeds). Output: iv.tag.ciphertext (base64). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed ciphertext");
  const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}
