import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Netlify injects the Neon connection string as NETLIFY_DATABASE_URL at
// build and runtime; fall back to DATABASE_URL for local/other hosts.
const datasourceUrl = process.env.NETLIFY_DATABASE_URL ?? process.env.DATABASE_URL;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
