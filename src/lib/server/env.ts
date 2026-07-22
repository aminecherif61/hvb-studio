import { z } from "zod";

// Validated once at first import; a missing secret fails loudly at boot
// instead of surfacing as a broken auth flow later.
const schema = z.object({
  // Either DATABASE_URL (local) or NETLIFY_DATABASE_URL (Neon) must resolve.
  DATABASE_URL: z.string().min(1).optional(),
  NETLIFY_DATABASE_URL: z.string().min(1).optional(),
  APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, "ENCRYPTION_KEY must be 32 bytes base64"),
  UPLOADS_DIR: z.string().default(".uploads"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default("HVB Studio <no-reply@localhost>"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid environment: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
  );
}

if (!parsed.data.DATABASE_URL && !parsed.data.NETLIFY_DATABASE_URL) {
  throw new Error("Invalid environment: set DATABASE_URL or NETLIFY_DATABASE_URL");
}

export const env = parsed.data;

/** Secure cookies whenever the canonical origin is https (always in prod). */
export const cookiesSecure = env.APP_URL.startsWith("https://") || env.NODE_ENV === "production";
