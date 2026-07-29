import { db } from "@/lib/server/db";
import { safe } from "@/lib/server/safe-db";
import { allPhotos } from "@/lib/photos";
import { Card, PageTitle } from "@/components/vault/ui";
import MediaManager from "./MediaManager";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const assets = await safe(
    () => db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
    [] as Awaited<ReturnType<typeof db.mediaAsset.findMany>>,
  );

  return (
    <>
      <PageTitle kicker="Gallery" title="Portfolio Manager" />
      <Card>
        <MediaManager
          assets={assets.map((a) => ({
            id: a.id,
            fileName: a.fileName,
            thumbName: a.thumbName,
            width: a.width,
            height: a.height,
            bytes: a.bytes,
            alt: a.alt,
          }))}
        />
      </Card>
      <Card className="mt-5" delay={0.1}>
        <p className="label text-smoke">Live site photographs</p>
        <p className="mt-2 text-xs text-smoke-dark">
          The {allPhotos.length} photographs currently published on the site, with their hero hierarchy.
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {allPhotos.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-2 text-sm">
              <span className="truncate text-ivory/85">{p.title}</span>
              <span className="label shrink-0 text-smoke-dark">
                {p.category} · {p.tier}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
