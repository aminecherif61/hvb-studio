import { getAuthedAdmin } from "@/lib/server/session";
import { PageTitle } from "@/components/vault/ui";
import SecurityPanel from "./SecurityPanel";

export const metadata = { title: "Security" };

export default async function SettingsPage() {
  const authed = (await getAuthedAdmin())!; // layout already guarded
  const s = authed.session;

  // Sessions are stateless, so the only one we can describe is this browser's.
  return (
    <>
      <PageTitle kicker="Account" title="Security" />
      <SecurityPanel
        email={authed.user.email}
        totpEnabled={authed.user.totpEnabled}
        currentSessionId={s.id}
        sessions={[
          {
            id: s.id,
            browser: s.browser ?? "This browser",
            os: s.os ?? "Unknown",
            ip: s.ip ?? "unknown",
            lastActiveAt: s.lastActiveAt.toISOString(),
          },
        ]}
        devices={[]}
      />
    </>
  );
}
