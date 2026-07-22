import Link from "next/link";
import { db } from "@/lib/server/db";
import { Badge, Card, PageTitle, Sparkline, StatCard, Empty } from "@/components/vault/ui";

export const metadata = { title: "Overview" };

function dayKey(offset: number): string {
  const d = new Date(Date.now() - offset * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export default async function OverviewPage() {
  const today = dayKey(0);
  const since7 = dayKey(6);
  const since30 = dayKey(29);

  const [viewsToday, views7, views30, uniques7, topPaths, byDay, inquiriesNew, inquiries30, recentInquiries, recentLogins] =
    await Promise.all([
      db.pageView.count({ where: { day: today } }),
      db.pageView.count({ where: { day: { gte: since7 } } }),
      db.pageView.count({ where: { day: { gte: since30 } } }),
      db.pageView
        .findMany({ where: { day: { gte: since7 } }, distinct: ["visitorHash"], select: { id: true } })
        .then((r) => r.length),
      db.pageView.groupBy({
        by: ["path"],
        where: { day: { gte: since30 } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 6,
      }),
      db.pageView.groupBy({ by: ["day"], where: { day: { gte: dayKey(13) } }, _count: { day: true } }),
      db.inquiry.count({ where: { status: "new" } }),
      db.inquiry.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } } }),
      db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.auditLog.findMany({
        where: { type: { in: ["login_success", "login_failure", "lockout"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const dayMap = new Map(byDay.map((d) => [d.day, d._count.day]));
  const spark = Array.from({ length: 14 }, (_, i) => dayMap.get(dayKey(13 - i)) ?? 0);

  return (
    <>
      <PageTitle kicker="The Vault" title="Overview" />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Views today" value={String(viewsToday)} hint={`${views7} this week`} />
        <StatCard label="Visitors · 7 days" value={String(uniques7)} hint="unique, privacy-safe" delay={0.05} />
        <StatCard label="Views · 30 days" value={String(views30)} delay={0.1} />
        <StatCard label="New inquiries" value={String(inquiriesNew)} hint={`${inquiries30} in 30 days`} delay={0.15} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" delay={0.1}>
          <div className="flex items-baseline justify-between">
            <p className="label text-smoke">Traffic · last 14 days</p>
            <p className="text-xs text-smoke-dark">views / day</p>
          </div>
          <div className="mt-6">
            <Sparkline points={spark} height={72} />
          </div>
        </Card>
        <Card delay={0.15}>
          <p className="label text-smoke">Top pages · 30 days</p>
          <ul className="mt-5 space-y-3">
            {topPaths.length === 0 && <li className="text-sm text-smoke-dark">No traffic recorded yet.</li>}
            {topPaths.map((p) => (
              <li key={p.path} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="truncate text-ivory/85">{p.path}</span>
                <span className="shrink-0 text-smoke-dark">{p._count.path}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card delay={0.2}>
          <div className="flex items-baseline justify-between">
            <p className="label text-smoke">Latest inquiries</p>
            <Link href="/admin/inquiries" className="link-draw label text-smoke-dark hover:text-ivory">
              View all
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <Empty title="No inquiries yet" body="New booking and contact requests will appear here the moment they arrive." />
          ) : (
            <ul className="mt-5 divide-y divide-white/[0.06]">
              {recentInquiries.map((inq) => (
                <li key={inq.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ivory/90">
                      {inq.name} <span className="text-smoke-dark">· {inq.shootType}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-smoke-dark">{inq.createdAt.toLocaleDateString("en-GB")}</p>
                  </div>
                  <Badge tone={inq.status === "new" ? "gold" : "gray"}>{inq.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card delay={0.25}>
          <div className="flex items-baseline justify-between">
            <p className="label text-smoke">Recent sign-in activity</p>
            <Link href="/admin/activity" className="link-draw label text-smoke-dark hover:text-ivory">
              Full log
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-white/[0.06]">
            {recentLogins.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivory/90">
                    {log.browser} <span className="text-smoke-dark">· {log.os}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-smoke-dark">
                    {log.ip} · {log.createdAt.toLocaleString("en-GB")}
                  </p>
                </div>
                <Badge tone={log.type === "login_success" ? "green" : log.type === "lockout" ? "red" : "gray"}>
                  {log.type.replace("login_", "")}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
