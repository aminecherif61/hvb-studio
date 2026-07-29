import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";

/**
 * The password is an environment variable, so it is changed in the hosting
 * dashboard (ADMIN_PASSWORD_HASH) rather than from inside the console.
 * README documents generating the Argon2id hash.
 */
export const PUT = apiHandler(async () => {
  await requireAdmin();
  throw new HttpError(
    501,
    "Password is managed in your hosting environment settings (ADMIN_PASSWORD_HASH).",
  );
});
