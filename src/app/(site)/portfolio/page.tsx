import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import PortfolioGallery from "./PortfolioGallery";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected photography by Hamdi Van Buuren — weddings, portraits, live stages and commercial work, arranged for rhythm rather than volume.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        kicker="Portfolio"
        lines={["Arranged for rhythm,", "not volume."]}
        standfirst="A curated selection across weddings, portraits, live stages and studio campaigns. Every frame here earned its place."
      />
      <PortfolioGallery />
      <CtaBand
        title="The next frame could be yours."
        body="Weddings, portraits, brands, stages — begin with the feeling you want the photographs to keep."
        href="/booking"
        cta="Book a Session"
      />
    </>
  );
}
