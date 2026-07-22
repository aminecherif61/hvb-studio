import { NextResponse } from "next/server";
import { getAuthedAdmin, type AuthedAdmin } from "./session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Route-handler guard: throws 401 unless a live admin session exists. */
export async function requireAdmin(): Promise<AuthedAdmin> {
  const authed = await getAuthedAdmin();
  if (!authed) throw new HttpError(401, "Authentication required");
  return authed;
}

/**
 * Uniform handler wrapper: converts HttpError/Zod issues into safe JSON and
 * never leaks stack traces or internals to the client.
 */
export function apiHandler<T extends unknown[]>(
  fn: (...args: T) => Promise<NextResponse | Response>,
): (...args: T) => Promise<NextResponse | Response> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err && typeof err === "object" && "issues" in (err as Record<string, unknown>)) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      console.error(JSON.stringify({ level: "error", scope: "vault.api", err: String(err) }));
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
