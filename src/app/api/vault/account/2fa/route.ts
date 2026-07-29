import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";

// Enrolling TOTP needs somewhere to keep the secret and recovery codes.
// Attach a database (see README) to enable two-factor authentication.
const UNAVAILABLE = "Two-factor authentication requires a connected database.";

export const POST = apiHandler(async () => {
  await requireAdmin();
  throw new HttpError(501, UNAVAILABLE);
});

export const PUT = apiHandler(async () => {
  await requireAdmin();
  throw new HttpError(501, UNAVAILABLE);
});

export const DELETE = apiHandler(async () => {
  await requireAdmin();
  throw new HttpError(501, UNAVAILABLE);
});
