import type { Metadata } from "next";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/motion";
import PageHero from "@/components/PageHero";
import PhotoFigure from "@/components/PhotoFigure";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "HVB Studio",
  description:
    "Campaigns, directed portraits and creative direction by HVB Studio — controlled light, clean composition, images built to carry a brand.",
};

const services = [
  {
    name: "Commercial shoots",
    detail: "Campaign-ready imagery for products, founders and brands.",
  },
  {
    name: "Portrait sessions",
    detail: "Directed portraits with polish, confidence and emotional control.",
  },
  {
    name: "Creative direction",
    detail: "A visual system for campaigns, editorials and high-level productions.",
  },
];

const process = [
  { step: "01", name: "Visual concept", detail: "The idea the images must carry — defined before anything is lit." },
  { step: "02", name: "Production planning", detail: "Set, styling, casting and schedule, planned to protect the concept." },
  { step: "03", name: "The session", detail: "Controlled light and calm direction. The set stays quiet; the images don't." },
  { step: "04", name: "Delivery", detail: "A coherent, retouched selection ready for every brand surface." },
];

export default function StudioPage() {
  return (
    <div className="bg-ivory text-noir">
      <PageHero
        kicker="HVB Studio"
        lines={["Images with", "presence."]}
        standfirst="Campaigns, portraits and creative direction for people and brands that need to be looked at twice."
        tone="light"
      />

      {/* opening duet */}
      <section className="px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
            <div className="md:col-span-7">
              <PhotoFigure
                photo={photos.denimEditorial}
                sizes="(min-width: 768px) 58vw, 100vw"
                caption="Denim, as landscape — a product story with a point of view"
                tone="light"
                priority
              />
            </div>
            <div className="md:col-span-4 md:col-start-9 md:mt-40">
              <PhotoFigure
                photo={photos.whiteCoatPortrait}
                sizes="(min-width: 768px) 33vw, 100vw"
                caption="Direction you can feel in the gaze"
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>

      {/* statement + services */}
      <section className="border-t border-line-light px-6 py-32 md:px-12 md:py-44">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-16 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <p className="display text-3xl leading-[1.15] md:text-4xl">
                The set stays calm. The images carry the weight.
              </p>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-smoke-dark">
                HVB Studio combines clean direction, controlled light and campaign
                thinking — imagery that looks polished without losing the person or
                the idea at its centre.
              </p>
            </Reveal>
            <div className="md:col-span-6 md:col-start-7">
              {services.map((service, i) => (
                <Reveal key={service.name} delay={i * 0.08}>
                  <div className="border-t border-line-light py-8 last:border-b md:py-10">
                    <div className="flex items-baseline justify-between gap-8">
                      <h3 className="display text-2xl md:text-3xl">{service.name}</h3>
                      <span className="label text-smoke-dark">0{i + 1}</span>
                    </div>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-smoke-dark">
                      {service.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* portrait duet */}
      <section className="px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
            <div className="md:col-span-4 md:col-start-2">
              <PhotoFigure
                photo={photos.profileStudy}
                sizes="(min-width: 768px) 32vw, 100vw"
                caption="Posture, silence, light"
                tone="light"
              />
            </div>
            <div className="md:col-span-4 md:col-start-8 md:mt-32">
              <PhotoFigure
                photo={photos.furPortrait}
                sizes="(min-width: 768px) 32vw, 100vw"
                caption="Polish without losing the person"
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>

      {/* process — noir interruption */}
      <section className="bg-noir px-6 py-32 text-ivory md:px-12 md:py-44">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-champagne">From idea to image</p>
            <h2 className="display mt-6 max-w-2xl text-4xl md:text-5xl">
              A process built to protect the concept.
            </h2>
          </Reveal>
          <div className="mt-20 grid gap-px border border-line-dark bg-line-dark md:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08} className="h-full">
                <div className="flex h-full flex-col bg-noir p-8 md:p-10">
                  <span className="label text-smoke-dark">{p.step}</span>
                  <h3 className="display mt-6 text-2xl">{p.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-smoke">{p.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <Link
              href="/projects/studio-portrait-direction"
              className="link-draw label text-smoke hover:text-ivory"
            >
              See a studio session in full
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand
        kicker="HVB Studio"
        title="Bring the next campaign a point of view."
        body="Share the brand, the idea and the timeline — the studio responds with a visual concept and a production plan."
        href="/booking"
        cta="Start a Project"
        tone="light"
      />
    </div>
  );
}
