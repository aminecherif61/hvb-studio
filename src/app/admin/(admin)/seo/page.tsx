import { db } from "@/lib/server/db";
import { Card, PageTitle } from "@/components/vault/ui";
import SeoForm from "./SeoForm";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  const rows = await db.setting.findMany({ where: { key: { in: ["siteTitle", "siteDescription", "ogImage"] } } });
  const value = (key: string) => rows.find((r) => r.key === key)?.value ?? "";

  return (
    <>
      <PageTitle kicker="Search & social" title="SEO" />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <SeoForm
            initial={{
              siteTitle: value("siteTitle"),
              siteDescription: value("siteDescription"),
              ogImage: value("ogImage"),
            }}
          />
        </Card>
        <Card delay={0.1}>
          <p className="label text-smoke">Already handled in code</p>
          <ul className="mt-4 space-y-3 text-sm text-ivory/80">
            <li>· Per-page titles & descriptions</li>
            <li>· Open Graph image (golden car hero)</li>
            <li>· sitemap.xml with all 11 routes</li>
            <li>· robots.txt (vault excluded from indexing)</li>
            <li>· Schema.org ProfessionalService JSON-LD</li>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-smoke-dark">
            Values saved here override the defaults on the next deploy — leave a field empty to keep the coded default.
          </p>
        </Card>
      </div>
    </>
  );
}
