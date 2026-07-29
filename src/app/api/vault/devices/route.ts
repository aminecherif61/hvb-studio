import { apiHandler, HttpError, requireAdmin } from "@/lib/server/guard";

// Trusted devices are tied to two-factor enrolment, which needs a database.
export const DELETE = apiHandler(async () => {
  await requireAdmin();
  throw new HttpError(501, "Trusted devices require a connected database.");
});
