import { db } from "@/lib/server/db";
import { Card, PageTitle } from "@/components/vault/ui";
import TestimonialManager from "./TestimonialManager";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageTitle kicker="Voices" title="Testimonials" />
      <Card>
        <p className="mb-6 text-xs leading-relaxed text-smoke-dark">
          Only publish words clients actually said — the site never shows fabricated praise. Unpublished entries stay
          private here.
        </p>
        <TestimonialManager
          items={testimonials.map((t) => ({
            id: t.id,
            author: t.author,
            role: t.role ?? "",
            quote: t.quote,
            published: t.published,
          }))}
        />
      </Card>
    </>
  );
}
