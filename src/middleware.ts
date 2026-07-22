import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// Edge-layer defense for the vault. Fast JWT signature/expiry check here;
// the server layout and every API route re-validate against the session
// store (DB) — this layer only fails closed early and cheaply.

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);
const ACCESS_COOKIES = ["__Host-hvb_at", "hvb_at"];

const PROTECTED_PAGE = /^\/admin\/(?!reset$)./; // everything under /admin except the login page + /admin/reset
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function hasValidAccessToken(req: NextRequest): Promise<boolean> {
  for (const name of ACCESS_COOKIES) {
    const token = req.cookies.get(name)?.value;
    if (!token) continue;
    try {
      const { payload } = await jwtVerify(token, SECRET, { issuer: "hvb-vault", audience: "hvb-vault" });
      if (payload.role === "admin") return true;
    } catch {
      /* fall through */
    }
  }
  return false;
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  // Non-CORS requests (same-origin navigations, some fetches) omit Origin;
  // Sec-Fetch-Site covers those on all modern browsers.
  const secFetchSite = req.headers.get("sec-fetch-site");
  if (origin) {
    try {
      return new URL(origin).host === req.nextUrl.host;
    } catch {
      return false;
    }
  }
  return secFetchSite === null || secFetchSite === "same-origin" || secFetchSite === "none";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF: state-changing API calls must originate from our own pages.
  // (Cookies are SameSite=Strict as well — this is defense in depth.)
  if (pathname.startsWith("/api/") && MUTATING.has(req.method)) {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }
  }

  // Auth gate for vault pages and vault APIs (auth endpoints excepted).
  const isVaultPage = PROTECTED_PAGE.test(pathname);
  const isVaultApi = pathname.startsWith("/api/vault/") && !pathname.startsWith("/api/vault/auth/");
  if ((isVaultPage || isVaultApi) && !(await hasValidAccessToken(req))) {
    if (isVaultApi) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const login = req.nextUrl.clone();
    login.pathname = "/admin";
    login.search = "";
    return NextResponse.redirect(login);
  }

  // Strict nonce CSP for every vault page (they are all dynamically rendered).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    // Dev-only: webpack HMR evaluates modules with eval(); never in production.
    const scriptExtra = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptExtra}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("content-security-policy", csp);
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/:path*"],
};
