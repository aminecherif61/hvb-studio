# Hamdi Van Buuren — hamdi-van-buuren.netlify.app

Portfolio site for photographer Hamdi Van Buuren (HVB Studio · HVB Weddings),
with a secure admin panel ("**The Vault**", `/vault`).
Next.js App Router · TypeScript · Tailwind CSS v4 · Framer Motion · Prisma ·
Zod · Argon2id. Security details: [SECURITY.md](SECURITY.md).

## Develop

```bash
npm install
cp .env.example .env        # fill in secrets (see comments in the file)
npx prisma migrate dev      # create/upgrade the local SQLite database
npm run vault:seed          # create the first admin from ADMIN_EMAIL/PASSWORD
npm run dev
```

Public site: `http://localhost:3100` (via the launch config) — admin:
`http://localhost:3100/vault`. Without SMTP configured, password-reset links
are printed to the server console.

## The Vault (admin)

- **Overview** — first-party, privacy-safe analytics (views, unique visitors,
  top pages, 14-day trend) + latest inquiries and sign-in activity
- **Inquiries** — booking/contact submissions with reply/archive workflow
  (the public form posts to `/api/inquiries`; Netlify Forms remains as a
  fallback delivery path)
- **Portfolio** — drag-and-drop uploads (re-encoded, thumbnailed, metadata
  stripped) + the live site's photo hierarchy
- **Testimonials / SEO** — content management backed by the database
- **Activity** — full security log (logins, failures, lockouts, resets…)
- **Security** — change password, TOTP 2FA with QR + recovery codes,
  active sessions, trusted devices
- **Blog** — future-ready placeholder

## Admin sign-in (how it works)

The console has a single owner, so there is no users table. Credentials come
from environment variables and sessions are stateless:

- `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH_B64` (Argon2id hash, base64-encoded —
  see `.env.example` for the one-liner that generates it).
- Access + refresh tokens are signed JWTs in HttpOnly / Secure /
  SameSite=Strict cookies, rotated on refresh, with a 12-hour absolute cap.
- Brute force: 5 failures per email/IP → 15-minute lock (in-memory).

**To change the password**, regenerate the hash and update
`ADMIN_PASSWORD_HASH_B64` in your host's environment settings. Rotating
`AUTH_SECRET` immediately invalidates every existing session.

Two-factor authentication, trusted devices and emailed password resets need a
persistent store — attach a database (below) to enable them.

## Optional database

Inquiries, uploads, testimonials and analytics persist to Postgres when
`DATABASE_URL` is set; without it those pages render empty states and
inquiries are written to the server log instead. To enable: set
`DATABASE_URL`, then create the schema once via `npx prisma db push` (or
`POST /api/admin/bootstrap` with the `x-bootstrap-secret` header).

## Production deployment

1. **Database** — provision PostgreSQL (Neon / Supabase / RDS). In
   `prisma/schema.prisma` switch `provider = "sqlite"` →
   `postgresql`, set `DATABASE_URL`, then run `npx prisma migrate dev --name init`
   once locally against it and `npm run db:deploy` in CI/build.
2. **Environment** — set every variable from `.env.example` in the host's
   env settings (Netlify → Site settings → Environment variables). Generate
   fresh `AUTH_SECRET` / `ENCRYPTION_KEY` per environment; set `APP_URL` to
   the canonical `https://` origin (this switches cookies to `__Host-`/Secure).
3. **SMTP** — set the `SMTP_*` vars so password-reset emails deliver
   (any transactional provider works).
4. **Uploads** — the local driver writes to `UPLOADS_DIR` on disk, which is
   ephemeral on serverless hosts. On Netlify/Vercel, point the storage calls
   in `src/lib/server/uploads.ts` at Netlify Blobs or S3 (the validation and
   processing pipeline stays identical), or run on a host with a persistent
   volume.
5. **Seed** — run `npm run vault:seed` once against the production DB, log
   in, change the password, enable 2FA, store the recovery codes.
6. Deploy: `netlify deploy --build --prod` (config in `netlify.toml`).

### Production checklist

- [ ] `APP_URL` is `https://…` (Secure + `__Host-` cookies active)
- [ ] Fresh `AUTH_SECRET` + `ENCRYPTION_KEY` (never reused from dev)
- [ ] Postgres provisioned, `migrate deploy` run, seed executed
- [ ] SMTP configured and a reset email test-delivered
- [ ] Admin password changed from the seeded value; 2FA enabled; recovery
      codes stored offline
- [ ] Uploads backed by persistent storage (Blobs/S3/volume)
- [ ] `npm audit` reviewed; sharp/next updated when upstream fixes land
- [ ] Verify security headers + CSP on the live origin
      (`curl -sI https://…/vault`)
- [ ] Lighthouse pass on `/` (public pages remain fully static)

## Where things live

- `src/lib/photos.ts` — every photograph with metadata and a **tier**
  (`hero` / `feature` / `support`) that drives layout prominence.
- `src/lib/projects.ts` — case studies (`/projects/[slug]`).
- `src/lib/server/` — the entire auth/security core (sessions, tokens,
  passwords, TOTP, rate limits, uploads, audit). Route handlers stay thin.
- `src/lib/validation.ts` — shared Zod schemas; the server always re-validates.
- `src/app/(site)/` — public pages (static). `src/app/vault/` — admin
  (dynamic, guarded). `src/middleware.ts` — edge gate + CSP.
- `prisma/schema.prisma` — data model (SQLite dev / Postgres prod).
- `src/components/motion.tsx` — public-site motion vocabulary;
  `src/components/vault/` — admin UI kit.

## Design system

- Public site: warm noir + ivory gallery inversions, champagne hairline
  accents, Cormorant Garamond display + Instrument Sans.
- Vault: true-black glassmorphism (`.glass` utilities), same typefaces, the
  same single easing curve — Apple-quiet, never flashy.
- The fixed public header uses `mix-blend-difference`; keep only neutral
  tones inside it.
