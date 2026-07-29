import { db } from "@/lib/server/db";
import { safe } from "@/lib/server/safe-db";
import { PageTitle, Card, Empty } from "@/components/vault/ui";
import InquiryList from "./InquiryList";

export const metadata = { title: "Inquiries" };

type Row = Awaited<ReturnType<typeof db.inquiry.findMany>>;

export default async function InquiriesPage() {
  const inquiries = await safe(
    () => db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    [] as unknown as Row,
  );

  return (
    <>
      <PageTitle kicker="Messages & bookings" title="Inquiries" />
      <Card>
        {inquiries.length === 0 ? (
          <Empty
            title="Quiet for now"
            body="Booking requests and contact messages from the site land here, ready to answer."
          />
        ) : (
          <InquiryList
            items={inquiries.map((i) => ({
              id: i.id,
              name: i.name,
              email: i.email,
              phone: i.phone ?? "",
              shootType: i.shootType,
              date: i.date ?? "",
              location: i.location ?? "",
              budget: i.budget ?? "",
              message: i.message,
              status: i.status,
              createdAt: i.createdAt.toISOString(),
            }))}
          />
        )}
      </Card>
    </>
  );
}
