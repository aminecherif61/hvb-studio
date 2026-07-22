import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export interface RequestContext {
  ip: string;
  country: string | null;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

/** Derive client context from proxy headers (Netlify / generic CDN aware). */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const ip =
    h.get("x-nf-client-connection-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const country = h.get("x-country") ?? h.get("cf-ipcountry") ?? null;
  const userAgent = h.get("user-agent") ?? "";
  const ua = UAParser(userAgent);
  return {
    ip,
    country,
    userAgent: userAgent.slice(0, 400),
    browser: [ua.browser.name, ua.browser.version].filter(Boolean).join(" ") || "Unknown",
    os: [ua.os.name, ua.os.version].filter(Boolean).join(" ") || "Unknown",
    device: ua.device.type ?? "desktop",
  };
}
