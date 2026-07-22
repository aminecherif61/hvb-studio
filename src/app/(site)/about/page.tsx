import type { Metadata } from "next";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/motion";
import PageHero from "@/components/PageHero";
import PhotoFigure from "@/components/PhotoFigure";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hamdi Van Buuren — founder of HVB Studio and HVB Weddings. A Tunisian photographer working across weddings, portraits, brands and live stages.",
};

const principles = [
  {
    step: "01",
    name: "Direction before decoration",
    detail:
      "Every session begins with the feeling the images need to carry — not with props, presets or trends.",
  },
  {
    step: "02",
    name: "Light with intention",
    detail:
      "Studio, wedding venue or arena stage: the work is shaped around controlled light and clear composition.",
  },
  {
    step: "03",
    name: "A finished image world",
    detail:
      "The final selection is edited for sequence, tone and longevity, so the photographs hold together as one body of work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About"
        lines={["A calm eye,", "three brands."]}
        standfirst="Hamdi Van Buuren photographs people, weddings, brands and live productions from Tunis — with one signature across all of it."
      />

      <section className="bg-noir px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <PhotoFigure
                photo={photos.elissaBackstage}
                sizes="(min-width: 768px) 40vw, 100vw"
                caption="From the work — backstage, before the lights"
                priority
              />
            </div>
            <Reveal delay={0.15} className="md:col-span-5 md:col-start-8 md:pt-24">
              <p className="display text-2xl leading-[1.3] text-ivory md:text-3xl">
                Founder of HVB Studio and HVB Weddings, Hamdi works with a visual
                language shaped by clean composition, controlled emotion and
                cinematic pacing.
              </p>
              <p className="mt-8 text-sm leading-relaxed text-smoke md:text-base">
                His images move between wedding stories, portraits, commercial
                productions and live events without losing the same signature:
                considered light, confident direction, and photographs that feel
                honest, polished and lasting.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-smoke md:text-base">
                Based in Tunis. Available for commissions internationally.
              </p>
              <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
                <Link href="/portfolio" className="link-draw label text-ivory">
                  View the work
                </Link>
                <Link href="/contact" className="link-draw label text-smoke hover:text-ivory">
                  Get in touch
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-32 text-noir md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-smoke-dark">Approach</p>
            <h2 className="display mt-6 max-w-3xl text-4xl md:text-6xl">
              The value is not one photograph. It is how the whole story is
              directed, edited and remembered.
            </h2>
          </Reveal>
          <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-3 md:gap-8">
            {principles.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.1}>
                <div className="border-t border-line-light pt-8">
                  <span className="label text-smoke-dark">{p.step}</span>
                  <h3 className="display mt-5 text-2xl md:text-3xl">{p.name}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke-dark">
                    {p.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Working on something worth photographing well?"
        body="Weddings, portraits, campaigns and stages — every commission starts with a short conversation."
        href="/booking"
        cta="Book a Session"
      />
    </>
  );
}
