/**
 * Content features (inquiries, media, analytics) use the database, but the
 * console must stay usable without one. `safe` turns any database failure
 * into the supplied fallback so pages render an empty state instead of a
 * 500, and logs once for diagnosis.
 */
export async function safe<T>(run: () => Promise<T>, fallback: T, label = "query"): Promise<T> {
  if (!databaseConfigured()) return fallback;
  try {
    return await run();
  } catch (err) {
    console.warn(
      JSON.stringify({ level: "warn", scope: "db", label, msg: "falling back", err: String(err).slice(0, 200) }),
    );
    return fallback;
  }
}

export function databaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}
