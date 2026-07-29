import { listInquiries } from "@/lib/server/inquiry-store";
import { PageTitle, Card, Empty } from "@/components/vault/ui";
import InquiryList from "./InquiryList";

export const metadata = { title: "Inquiries" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InquiriesPage() {
  const inquiries = await listInquiries();

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
          <InquiryList items={inquiries} />
        )}
      </Card>
    </>
  );
}
