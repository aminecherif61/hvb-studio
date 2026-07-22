import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { randomBytes } from "node:crypto";

const ISSUER = "HVB Vault";

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ buffer: randomBytes(20).buffer as ArrayBuffer }).base32;
}

function totpFor(secretB32: string, label: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1", // authenticator-app standard
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretB32),
  });
}

/** ±1 time-step tolerance for clock drift. */
export function verifyTotp(secretB32: string, code: string, label: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  return totpFor(secretB32, label).validate({ token: code, window: 1 }) !== null;
}

export async function totpQrDataUrl(secretB32: string, label: string): Promise<{ uri: string; qr: string }> {
  const uri = totpFor(secretB32, label).toString();
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 240, color: { dark: "#0f0d0b", light: "#f3eee6" } });
  return { uri, qr };
}

/** Ten single-use recovery codes, shown to the admin exactly once. */
export function generateRecoveryCodes(): string[] {
  const alphabet = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // no ambiguous chars
  return Array.from({ length: 10 }, () => {
    const raw = Array.from(randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
