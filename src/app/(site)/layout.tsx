import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Beacon from "@/components/Beacon";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Hamdi Van Buuren — HVB Studio",
  description:
    "Wedding, portrait, commercial and live-stage photography by Hamdi Van Buuren, founder of HVB Studio and HVB Weddings.",
  areaServed: "Tunisia and international",
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  founder: { "@type": "Person", name: "Hamdi Van Buuren" },
  sameAs: [
    "https://www.instagram.com/hamdi_van_buuren/",
    "https://www.instagram.com/hvb_weddings/",
    "https://www.instagram.com/hvbstudio/",
  ],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="label sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:bg-ivory focus:px-4 focus:py-3 focus:text-noir"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content">{children}</main>
      <SiteFooter />
      <Beacon />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
