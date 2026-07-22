import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { HeroDrift, Parallax, Reveal, StaggerLines } from "@/components/motion";
import PhotoFigure from "@/components/PhotoFigure";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "HVB Weddings",
  description:
    "A dedicated wedding photography experience by Hamdi Van Buuren — intimate now, timeless years from now. Tunisia and destination weddings.",
};

const story = [
  { photo: photos.bridalReflection, beat: "01 · Preparation", note: "Before the day begins to move." },
  { photo: photos.bridalBouquet, beat: "02 · Details", note: "The small things that carry the memory." },
  { photo: photos.couplePortrait, beat: "03 · Portraits", note: "Human, never stiff." },
  { photo: photos.celebrationLift, beat: "04 · Celebration", note: "Grand when the moment asks for it." },
];

const packages = [
  {
    name: "Essential Story",
    blurb: "Refined coverage for intimate celebrations.",
    includes: [
      "Pre-wedding consultation",
      "Wedding-day photography",
      "Curated online gallery",
      "Signature editing",
    ],
  },
  {
    name: "Signature Wedding",
    blurb: "The complete HVB Weddings experience — a cinematic visual story of the day.",
    includes: [
      "Full-day coverage",
      "Editorial couple session",
      "Family and guest story",
      "Private gallery delivery",
      "Album-ready selection",
    ],
    featured: true,
  },
  {
    name: "Destination Production",
    blurb: "A high-touch production for destination and multi-day celebrations.",
    includes: [
      "Multi-day storytelling",
      "Location scouting",
      "Creative direction",
      "Extended private delivery",
      "Priority booking support",
    ],
  },
];

export default function WeddingsPage() {
  return (
    <>
      <section className="relative h-[100svh] overflow-hidden bg-noir">
        <HeroDrift className="absolute inset-0">
          <Image
            src={photos.goldenCarArchitecture.src}
            alt={photos.goldenCarArchitecture.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_60%]"
          />
        </HeroDrift>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/20 to-noir/30" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12 md:pb-20">
          <div className="mx-auto max-w-[1680px]">
            <Reveal delay={0.8} y={10}>
              <p className="label text-ivory/70">HVB Weddings</p>
            </Reveal>
            <h1 className="display mt-5 text-[11vw] text-ivory sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              <StaggerLines delay={0.9} lines={["Intimate now.", "Timeless later."]} />
            </h1>
            <Reveal delay={1.4} y={12}>
              <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
                <Link
                  href="/booking"
                  className="label border border-ivory/40 px-8 py-4 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne"
                >
                  Reserve Your Date
                </Link>
                <a href="#story" className="link-draw label text-ivory/80 hover:text-ivory">
                  See the story
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-noir px-6 py-32 md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-2">
              <p className="label text-champagne">The approach</p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-8 md:col-start-4">
              <p className="display max-w-3xl text-3xl leading-[1.15] text-ivory md:text-5xl">
                Quiet when it should be, grand when the moment asks for it — and
                human everywhere.
              </p>
              <p className="mt-10 max-w-xl text-sm leading-relaxed text-smoke md:text-base">
                HVB Weddings is built for couples who care about atmosphere:
                preparation, architecture, family gravity, small gestures, and the
                private moments between the official ones.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* the story sequence — ivory gallery */}
      <section id="story" className="bg-ivory px-6 py-32 text-noir md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-smoke-dark">The day, in sequence</p>
            <h2 className="display mt-6 max-w-2xl text-4xl md:text-6xl">
              The edit follows the day as it actually feels.
            </h2>
          </Reveal>

          <div className="mt-24 space-y-28 md:mt-36 md:space-y-48">
            {story.map((step, i) => (
              <div key={step.photo.id} className="grid items-end gap-x-8 gap-y-8 md:grid-cols-12">
                <div
                  className={
                    i % 2 === 0
                      ? "md:col-span-6 md:col-start-1"
                      : "md:col-span-6 md:col-start-7"
                  }
                >
                  <PhotoFigure
                    photo={step.photo}
                    sizes="(min-width: 768px) 48vw, 100vw"
                    plaque={false}
                  />
                </div>
                <Reveal
                  delay={0.15}
                  className={
                    i % 2 === 0
                      ? "md:col-span-4 md:col-start-8 md:pb-6"
                      : "md:col-span-4 md:col-start-2 md:row-start-1 md:pb-6 md:text-right"
                  }
                >
                  <p className="label text-smoke-dark">{step.beat}</p>
                  <p className="display mt-4 text-2xl md:text-3xl">{step.note}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the closing frame */}
      <section className="relative overflow-hidden bg-noir">
        <Parallax strength={80} className="relative h-[110svh]">
          <Image
            src={photos.goldenCarIntimate.src}
            alt={photos.goldenCarIntimate.alt}
            fill
            sizes="100vw"
            className="scale-[1.12] object-cover object-[50%_35%]"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-20 md:px-12 md:pb-28">
          <div className="mx-auto max-w-[1680px]">
            <Reveal>
              <p className="label text-ivory/70">05 · The closing frame</p>
              <p className="display mt-6 max-w-2xl text-3xl text-ivory md:text-5xl">
                The photograph that makes the date feel worth protecting.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* packages */}
      <section className="bg-noir px-6 py-32 md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-champagne">Wedding collections</p>
            <h2 className="display mt-6 max-w-2xl text-4xl text-ivory md:text-6xl">
              Three ways to build the story.
            </h2>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-smoke">
              Every wedding is proposed individually — collections are shaped around
              the place, the scale and the day itself. Pricing follows the proposal,
              not the other way around.
            </p>
          </Reveal>
          <div className="mt-20 grid gap-px overflow-hidden border border-line-dark bg-line-dark md:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.name} delay={i * 0.1} className="h-full">
                <div
                  className={`flex h-full flex-col bg-noir p-10 md:p-12 ${
                    pkg.featured ? "md:bg-noir-raised" : ""
                  }`}
                >
                  <p className="label text-smoke-dark">By inquiry</p>
                  <h3 className="display mt-6 text-3xl text-ivory">{pkg.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-smoke">{pkg.blurb}</p>
                  <ul className="mt-10 flex-1 space-y-4 border-t border-line-dark pt-8">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex gap-4 text-sm text-ivory/80">
                        <span className="text-champagne" aria-hidden>
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/booking"
                    className={`label mt-12 inline-block self-start border px-8 py-4 transition-colors duration-500 ${
                      pkg.featured
                        ? "border-champagne text-champagne hover:bg-champagne hover:text-noir"
                        : "border-ivory/25 text-ivory hover:border-champagne hover:text-champagne"
                    }`}
                  >
                    Begin the Inquiry
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        kicker="One wedding per date"
        title="Begin with the place, the date and the feeling."
        body="The inquiry is intentionally simple. You will receive availability, approach and a tailored proposal."
        href="/booking"
        cta="Reserve Your Date"
      />
    </>
  );
}
