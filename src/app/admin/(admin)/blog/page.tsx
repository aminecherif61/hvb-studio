import { Card, Empty, PageTitle } from "@/components/vault/ui";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <>
      <PageTitle kicker="Stories" title="Blog" />
      <Card>
        <Empty
          title="Reserved for the journal."
          body="The data model and this space are ready — when the journal launches, posts will be written and published from here."
        />
      </Card>
    </>
  );
}
