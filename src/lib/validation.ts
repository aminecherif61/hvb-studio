import { z } from "zod";

// Shared request schemas. Frontend may reuse these for inline hints, but the
// server always re-validates — client validation is UX, not security.

const trimmed = (max: number) => z.string().trim().min(1).max(max);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
  website: z.string().max(0).optional().default(""), // honeypot
});

export const mfaSchema = z.object({
  code: z.string().trim().max(24),
  rememberDevice: z.boolean().optional().default(false),
});

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(1).max(128),
});

export const inquirySchema = z.object({
  name: trimmed(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  shootType: trimmed(60),
  date: z.string().trim().max(80).optional().default(""),
  location: z.string().trim().max(160).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: trimmed(4000),
  website: z.string().max(0).optional().default(""), // honeypot
});

export const idSchema = z.string().min(10).max(40).regex(/^[a-z0-9]+$/i);

export const inquiryUpdateSchema = z.object({
  id: idSchema,
  status: z.enum(["new", "replied", "archived"]),
});

export const testimonialSchema = z.object({
  author: trimmed(120),
  role: z.string().trim().max(120).optional().default(""),
  quote: trimmed(1000),
  published: z.boolean().optional().default(false),
});

export const settingsSchema = z.object({
  siteTitle: z.string().trim().max(120).optional().default(""),
  siteDescription: z.string().trim().max(300).optional().default(""),
  ogImage: z.string().trim().max(300).optional().default(""),
});

export const beaconSchema = z.object({
  path: z
    .string()
    .max(200)
    .regex(/^\/[a-zA-Z0-9\-_/[\]]*$/, "invalid path"),
});
