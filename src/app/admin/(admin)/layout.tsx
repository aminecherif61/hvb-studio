import { redirect } from "next/navigation";
import { getAuthedAdmin } from "@/lib/server/session";
import Shell from "@/components/vault/Shell";

// Server-side gate: the middleware already checked the JWT at the edge, but
// the session store is the source of truth — revoked or idle sessions land
// back on the login page regardless of token validity.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await getAuthedAdmin();
  if (!authed) redirect("/admin");

  return <Shell email={authed.user.email}>{children}</Shell>;
}
