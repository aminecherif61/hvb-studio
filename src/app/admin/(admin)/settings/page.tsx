import { db } from "@/lib/server/db";
import { getAuthedAdmin } from "@/lib/server/session";
import { PageTitle } from "@/components/vault/ui";
import SecurityPanel from "./SecurityPanel";

export const metadata = { title: "Security" };

export default async function SettingsPage() {
  const authed = (await getAuthedAdmin())!; // layout already guarded
  const [sessions, devices] = await Promise.all([
    db.session.findMany({
      where: { userId: authed.user.id, revokedAt: null, absoluteExpiresAt: { gte: new Date() } },
      orderBy: { lastActiveAt: "desc" },
    }),
    db.trustedDevice.findMany({
      where: { userId: authed.user.id, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <PageTitle kicker="Account" title="Security" />
      <SecurityPanel
        email={authed.user.email}
        totpEnabled={authed.user.totpEnabled}
        currentSessionId={authed.session.id}
        sessions={sessions.map((s) => ({
          id: s.id,
          browser: s.browser ?? "Unknown",
          os: s.os ?? "Unknown",
          ip: s.ip ?? "unknown",
          lastActiveAt: s.lastActiveAt.toISOString(),
        }))}
        devices={devices.map((d) => ({
          id: d.id,
          label: d.label,
          createdAt: d.createdAt.toISOString(),
          expiresAt: d.expiresAt.toISOString(),
        }))}
      />
    </>
  );
}
