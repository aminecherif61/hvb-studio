import { cookies } from "next/headers";
import { cookiesSecure } from "./env";

// __Host- prefix binds the cookie to this exact origin with Path=/ and Secure.
// The prefix is only valid with the Secure attribute, so it is dropped in
// plain-http local dev (where Secure cookies are unreliable outside Chrome).
const PREFIX = cookiesSecure ? "__Host-" : "";

export const COOKIE = {
  access: `${PREFIX}hvb_at`,
  refresh: `${PREFIX}hvb_rt`,
  preAuth: `${PREFIX}hvb_pre`,
  trustedDevice: `${PREFIX}hvb_td`,
} as const;

const BASE = {
  httpOnly: true,
  secure: cookiesSecure,
  sameSite: "strict" as const,
  path: "/",
};

export async function setCookie(name: string, value: string, maxAgeSeconds: number) {
  (await cookies()).set(name, value, { ...BASE, maxAge: maxAgeSeconds });
}

export async function getCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}

export async function clearCookie(name: string) {
  (await cookies()).set(name, "", { ...BASE, maxAge: 0 });
}

export async function clearAuthCookies() {
  await clearCookie(COOKIE.access);
  await clearCookie(COOKIE.refresh);
  await clearCookie(COOKIE.preAuth);
}
