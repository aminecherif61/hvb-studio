import { apiHandler, HttpError } from "@/lib/server/guard";

/**
 * Two-factor verification is unavailable while the console runs on
 * environment credentials: enrolling a TOTP secret or recovery codes needs a
 * persistent store. Sign-in never issues an MFA challenge in this mode, so
 * reaching here means a stale client — send it back to the login page.
 */
export const POST = apiHandler(async () => {
  throw new HttpError(400, "Sign in again");
});
