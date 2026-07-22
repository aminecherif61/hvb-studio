import type { Metadata } from "next";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/motion";
import PageHero from "@/components/PageHero";
import PhotoFigure from "@/components/PhotoFigure";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Hamdi Van Buuren, HVB Studio and HVB Weddings — for weddings, brands, portraits and private commissions.",
};

const channels = [
  {
    label: "Hamdi Van Buuren",
    handle: "@hamdi_van_buuren",
    href: "https://www.instagram.com/hamdi_van_buuren/",
    note: "Portraits, live stages, commissions",
  },
  {
    label: "HVB Weddings",
    handle: "@hvb_weddings",
    href: "https://www.instagram.com/hvb_weddings/",
    note: "Weddings and couple sessions",
  },
  {
    label: "HVB Studio",
    handle: "@hvbstudio",
    href: "https://www.instagram.com/hvbstudio/",
    note: "Brands, campaigns, studio work",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        lines={["Start the", "conversation."]}
        standfirst="Based in Tunis, working to an international standard. For weddings, brands, portraits and private gallery access."
      />
      <section className="bg-noir px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-x-8 gap-y-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal>
                <Link
                  href="/booking"
                  className="group block border border-line-dark p-10 transition-colors duration-500 hover:border-champagne md:p-14"
                >
                  <p className="label text-champagne">The fastest way</p>
                  <p className="display mt-6 text-3xl text-ivory md:text-4xl">
                    Begin a booking inquiry
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
                    Share the date, the place and the feeling — receive availability
                    and a tailored proposal, personally.
                  </p>
                  <span className="label mt-10 inline-block text-ivory transition-colors duration-500 group-hover:text-champagne">
                    Begin →
                  </span>
                </Link>
              </Reveal>

              <div className="mt-16">
                <Reveal>
                  <p className="label text-smoke-dark">Direct on Instagram</p>
                </Reveal>
                {channels.map((c, i) => (
                  <Reveal key={c.handle} delay={i * 0.08}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline justify-between gap-6 border-b border-line-dark py-6"
                    >
                      <span>
                        <span className="block text-base text-ivory transition-colors duration-500 group-hover:text-champagne">
                          {c.handle}
                        </span>
                        <span className="mt-1 block text-xs text-smoke">{c.note}</span>
                      </span>
                      <span className="label text-smoke-dark transition-colors duration-500 group-hover:text-champagne">
                        ↗
                      </span>
                    </a>
                  </Reveal>
                ))}
                <Reveal delay={0.3}>
                  <p className="label mt-10 text-smoke-dark">Tunis, Tunisia</p>
                </Reveal>
              </div>
            </div>

            <div className="md:col-span-5 md:col-start-8">
              <PhotoFigure
                photo={photos.elissaSpotlight}
                sizes="(min-width: 768px) 40vw, 100vw"
                caption="Under the spotlight"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
