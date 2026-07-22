"use client";

// Thin client for vault APIs. Cookies ride along automatically (same-origin);
// errors surface as the server's safe message only.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function rawFetch(path: string, init: { method?: string; body?: unknown; formData?: FormData }) {
  return fetch(path, {
    method: init.method ?? "POST",
    headers: init.formData ? undefined : { "Content-Type": "application/json" },
    body: init.formData ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
  });
}

export async function api<T = { ok: true }>(
  path: string,
  init: { method?: string; body?: unknown; formData?: FormData } = {},
): Promise<T> {
  let res = await rawFetch(path, init);

  // Access tokens are short-lived by design; on 401, rotate the refresh
  // token once and replay. A failed rotation means the session is over.
  if (res.status === 401 && !path.startsWith("/api/vault/auth/")) {
    const refreshed = await fetch("/api/vault/auth/refresh", { method: "POST" });
    if (refreshed.ok) {
      res = await rawFetch(path, init);
    } else {
      window.location.assign("/admin");
      throw new ApiError(401, "Session expired");
    }
  }

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    throw new ApiError(res.status, typeof data.error === "string" ? data.error : "Something went wrong");
  }
  return data as T;
}
