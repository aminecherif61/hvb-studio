# HVB Vault — Security Documentation

Admin panel lives at **`/vault`** (deliberately not `/admin`, `/login` or
`/dashboard`). All vault pages are excluded from indexing (robots meta +
`X-Robots-Tag`) and every layer re-validates auth server-side.

## Architecture

| Layer | What it enforces |
| --- | --- |
| Edge middleware | JWT signature/expiry gate for `/vault/*` pages & APIs, CSRF origin checks on every mutating `/api/*` call, per-request nonce CSP |
| Server layout guard | Full session check against the DB (revocation, idle, absolute expiry) before rendering any admin page |
| Route handlers | `requireAdmin()` on every protected endpoint — the DB session store is the single source of truth |
| Client | UX only. No authorization decisions are made in the browser. |

## Authentication

- **Passwords**: Argon2id (`m=19456, t=2, p=1` — OWASP recommendation), never
  stored or logged in plain text. Unknown-account logins verify against a
  dummy hash so response timing does not reveal account existence.
- **Policy**: ≥14 chars, upper + lower + digit + special, checked server-side.
  Candidate passwords are screened against **Have I Been Pwned** via the
  k-anonymity range API (only a 5-char SHA-1 prefix leaves the server;
  fails open on network trouble).
- **Sessions**: 10-minute access JWT (HS256, issuer/audience pinned) +
  opaque 256-bit refresh token, both in `HttpOnly` / `Secure` /
  `SameSite=Strict` cookies (`__Host-` prefixed in production). Nothing
  auth-related ever touches localStorage.
- **Rotation**: every refresh rotates the token. A rotated token presented
  again outside a 10-second concurrency grace window is treated as theft and
  the whole session is revoked.
- **Expiry**: 30-minute inactivity window, 12-hour absolute cap, automatic
  idle logout in the client, session revocation on logout / password change /
  reset.

## Two-factor authentication

- Optional TOTP (RFC 6238, SHA-1/6/30 — Google Authenticator compatible),
  QR + manual key setup, confirmed with a live code before activation.
- Secret encrypted at rest with AES-256-GCM (`ENCRYPTION_KEY`).
- 10 single-use recovery codes (stored as SHA-256 hashes, shown exactly once).
- "Trust this device for 30 days" via a separate hashed token; devices are
  listed and revocable in Settings. Disabling 2FA requires the password and
  wipes recovery codes + trusted devices.

## Brute-force & abuse controls

- 5 failed logins → account locked 15 minutes (counter resets on success).
- 20 failures per IP / 15 min → IP throttled across accounts.
- Forgot-password: 3/hour per email, 5/hour per IP; response is identical
  whether or not the account exists.
- Public inquiry form: 5 submissions / 10 min / IP + honeypot field.
- All limits are DB-backed (correct across serverless instances). For very
  high traffic, swap the counters in `src/lib/server/rate-limit.ts` for
  Upstash Redis — call sites are unchanged.

## Password reset

Single-use token (256-bit, stored as SHA-256), 15-minute expiry, consumed
atomically before any state changes; on success **all** sessions are revoked.
Errors are generic ("This reset link is invalid or has expired."). With no
SMTP configured the link is printed to server logs only (dev).

## Injection & XSS

- **SQLi**: all data access through Prisma parameterized queries; zero raw SQL.
- **Input**: every endpoint validates with Zod (length caps, format, enums)
  before anything touches the DB; client validation is cosmetic only.
- **XSS**: React auto-escaping; no `dangerouslySetInnerHTML` with user data
  (the only usage is build-time JSON-LD). Vault CSP is nonce-based with
  `strict-dynamic`; public pages get a tight static CSP.
- **Errors**: `apiHandler` maps everything to safe messages; stack traces and
  Prisma errors never reach the client. Auth failures all read
  "Invalid credentials".

## Headers

`Strict-Transport-Security` (preload), `X-Frame-Options: SAMEORIGIN` +
`frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(camera/mic/geo denied), CSP everywhere (nonce on vault). Helmet is not
needed — these are set natively via `next.config.ts` + middleware.

## File uploads

Size cap (15 MB) → magic-byte sniff via sharp (client MIME/extension are
never trusted) → full re-encode to WebP (strips EXIF/GPS and any embedded
payloads) → thumbnail generation → random 128-bit hex filename. Files live
**outside** `public/` and are served only through `/media/[name]`, which
accepts nothing but `^[a-f0-9]{32}(-thumb)?\.webp$` — no traversal, no
executables, `nosniff` on responses. `limitInputPixels` guards against
decompression bombs.

## Audit trail

Every security event (success/failure/lockout/MFA/logout/reset/2FA changes/
revocations/replays) is stored with IP, country (when the CDN provides it),
browser, OS, device and timestamp — reviewable under **Vault → Activity** —
and mirrored to stdout as structured JSON for platform log drains.

## Privacy

Site analytics store no raw IP and no cross-day identifier: the visitor hash
is `sha256(dailySalt(ip, ua))` with a salt derived from a server secret and
the date. Automation (webdriver) is excluded.

## Known accepted risks

- `sharp`/libvips upstream CVEs (GHSA-f88m-g3jw-g9cj): mitigated by input
  caps, format whitelist and full re-encode; update sharp when patched.
- `next` bundles a postcss version with a stringifier advisory — not
  reachable (no untrusted CSS is ever stringified).
- Public pages use `'unsafe-inline'` script CSP (required by Next.js static
  hydration without per-request nonces); they contain no user-generated
  content and no auth state readable by scripts (cookies are HttpOnly).
