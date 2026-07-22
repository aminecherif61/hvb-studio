import { db } from "@/lib/server/db";
import { Badge, Card, Empty, PageTitle } from "@/components/vault/ui";

export const metadata = { title: "Activity" };

const TONE: Record<string, "green" | "red" | "gold" | "gray"> = {
  login_success: "green",
  mfa_success: "green",
  login_failure: "red",
  mfa_failure: "red",
  lockout: "red",
  refresh_reuse: "red",
  password_reset: "gold",
  password_reset_requested: "gold",
  password_changed: "gold",
  twofa_enabled: "gold",
  twofa_disabled: "gold",
  recovery_code_used: "gold",
};

export default async function ActivityPage() {
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <PageTitle kicker="Security trail" title="Activity Log" />
      <Card>
        {logs.length === 0 ? (
          <Empty title="No events yet" body="Every sign-in, failure, lockout and security change is recorded here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {["Event", "IP", "Browser", "System", "Device", "When"].map((h) => (
                    <th key={h} className="label whitespace-nowrap py-3 pr-6 font-medium text-smoke-dark">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 pr-6">
                      <Badge tone={TONE[log.type] ?? "gray"}>{log.type.replaceAll("_", " ")}</Badge>
                      {log.detail && <span className="ml-2 text-xs text-smoke-dark">{log.detail}</span>}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-6 text-ivory/75">
                      {log.ip}
                      {log.country && <span className="text-smoke-dark"> · {log.country}</span>}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-6 text-ivory/75">{log.browser}</td>
                    <td className="whitespace-nowrap py-3 pr-6 text-ivory/75">{log.os}</td>
                    <td className="whitespace-nowrap py-3 pr-6 capitalize text-ivory/75">{log.device}</td>
                    <td className="whitespace-nowrap py-3 text-smoke">{log.createdAt.toLocaleString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
