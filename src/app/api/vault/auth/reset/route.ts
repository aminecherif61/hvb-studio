import { apiHandler, HttpError } from "@/lib/server/guard";

/**
 * Password resets are performed by changing ADMIN_PASSWORD_HASH in the host's
 * environment settings (see README), so there is no token to redeem here.
 */
export const POST = apiHandler(async () => {
  throw new HttpError(400, "This reset link is invalid or has expired.");
});
