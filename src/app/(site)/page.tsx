import Image from "next/image";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { projects } from "@/lib/projects";
import { HeroDrift, ImageReveal, Parallax, Reveal, StaggerLines } from "@/components/motion";
import PhotoFigure from "@/components/PhotoFigure";
import CtaBand from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      {/* ACT I — the hero frame */}
      <section className="relative h-[100svh] overflow-hidden bg-noir">
        <HeroDrift className="absolute inset-0">
          <Image
            src={photos.goldenCarIntimate.src}
            alt={photos.goldenCarIntimate.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_38%]"
          />
        </HeroDrift>
        <div
          className="absolute inset-0 bg-gradient-to-t from-noir via-noir/25 to-noir/40"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12 md:pb-20">
          <div className="mx-auto max-w-[1680px]">
            <Reveal delay={0.9} y={10}>
              <p className="label text-ivory/70">Photographer · Tunis</p>
            </Reveal>
            <h1 className="display mt-5 text-[11.5vw] text-ivory sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              <StaggerLines delay={1.0} lines={["Photographs that", "outlive the day."]} />
            </h1>
            <Reveal delay={1.5} y={12}>
              <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
                <Link
                  href="/booking"
                  className="label border border-ivory/40 px-8 py-4 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne"
                >
                  Book a Session
                </Link>
                <Link href="/portfolio" className="link-draw label text-ivory/80 hover:text-ivory">
                  View Portfolio
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
        <div
          className="absolute bottom-16 right-6 hidden md:right-12 lg:block"
          aria-hidden
        >
          <div className="h-20 w-px animate-pulse bg-ivory/40" />
        </div>
      </section>

      {/* ACT II — the statement */}
      <section className="bg-noir px-6 py-32 md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-2">
              <p className="label text-champagne">The work</p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-9 md:col-start-4">
              <p className="display max-w-4xl text-3xl leading-[1.15] text-ivory md:text-5xl">
                Weddings, portraits, brands and live stages — photographed with one
                calm eye for light, posture and atmosphere.
              </p>
              <p className="mt-10 max-w-xl text-sm leading-relaxed text-smoke md:text-base">
                Hamdi Van Buuren is the founder of HVB Studio and HVB Weddings. The
                signature never changes: considered light, confident direction, and
                photographs made to feel honest years from now.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ACT III — three worlds */}
      <section className="bg-noir px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            <Link href="/hvb-weddings" className="group block">
              <PhotoFigure
                photo={photos.goldenCarArchitecture}
                sizes="(min-width: 768px) 50vw, 100vw"
                plaque={false}
              />
              <Reveal y={14}>
                <div className="mt-6 flex items-baseline justify-between border-t border-line-dark pt-5">
                  <div>
                    <p className="label text-champagne">HVB Weddings</p>
                    <p className="display mt-3 text-3xl text-ivory md:text-4xl">
                      A frame you can live inside.
                    </p>
                  </div>
                  <span className="label text-smoke transition-colors duration-500 group-hover:text-champagne">
                    Enter →
                  </span>
                </div>
              </Reveal>
            </Link>

            <div className="grid content-start gap-y-16">
              <Link href="/hvb-studio" className="group block md:max-w-[75%] md:justify-self-end">
                <PhotoFigure
                  photo={photos.whiteCoatPortrait}
                  sizes="(min-width: 768px) 37vw, 100vw"
                  plaque={false}
                />
                <Reveal y={14}>
                  <div className="mt-6 flex items-baseline justify-between border-t border-line-dark pt-5">
                    <div>
                      <p className="label text-champagne">HVB Studio</p>
                      <p className="display mt-3 text-2xl text-ivory md:text-3xl">
                        Presence, directed.
                      </p>
                    </div>
                    <span className="label text-smoke transition-colors duration-500 group-hover:text-champagne">
                      Enter →
                    </span>
                  </div>
                </Reveal>
              </Link>

              <Link href="/projects/elissa-live-stage" className="group block md:max-w-[75%]">
                <PhotoFigure
                  photo={photos.elissaStageArrival}
                  sizes="(min-width: 768px) 37vw, 100vw"
                  plaque={false}
                />
                <Reveal y={14}>
                  <div className="mt-6 flex items-baseline justify-between border-t border-line-dark pt-5">
                    <div>
                      <p className="label text-champagne">Live Stages</p>
                      <p className="display mt-3 text-2xl text-ivory md:text-3xl">
                        Scale, light, emotion.
                      </p>
                    </div>
                    <span className="label text-smoke transition-colors duration-500 group-hover:text-champagne">
                      Enter →
                    </span>
                  </div>
                </Reveal>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ACT IV — the wedding story, ivory gallery */}
      <section className="bg-ivory px-6 py-32 text-noir md:px-12 md:py-48">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-smoke-dark">A wedding, as it actually feels</p>
            <h2 className="display mt-6 max-w-3xl text-4xl md:text-6xl">
              Quiet when it should be. Grand when the moment asks.
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-x-8 gap-y-20 md:mt-32 md:grid-cols-12">
            <div className="md:col-span-7">
              <PhotoFigure
                photo={photos.bridalReflection}
                sizes="(min-width: 768px) 58vw, 100vw"
                caption="Preparation — before the day begins to move"
                tone="light"
              />
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end md:pb-24">
              <PhotoFigure
                photo={photos.bridalBouquet}
                sizes="(min-width: 768px) 33vw, 100vw"
                caption="The details carry the memory"
                tone="light"
              />
              <Reveal delay={0.15}>
                <p className="display mt-12 text-2xl italic leading-snug text-noir/80 md:text-3xl">
                  “The private moments between the official ones — that is where the
                  wedding lives.”
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-24 text-center md:mt-36">
            <Link
              href="/hvb-weddings"
              className="label inline-block border border-noir/30 px-10 py-4 text-noir transition-colors duration-500 hover:bg-noir hover:text-ivory"
            >
              Reserve Your Wedding
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ACT V — the stage moment */}
      <section className="relative overflow-hidden bg-noir">
        <Parallax strength={90} className="relative h-[110svh] md:h-[130svh]">
          <Image
            src={photos.elissaStageCommand.src}
            alt={photos.elissaStageCommand.alt}
            fill
            sizes="100vw"
            className="scale-[1.15] object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/60" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-20 md:px-12 md:pb-32">
          <div className="mx-auto max-w-[1680px]">
            <Reveal>
              <p className="label text-ivory/70">Elissa · Live</p>
              <p className="display mt-6 max-w-2xl text-3xl text-ivory md:text-5xl">
                One performer. Ten thousand people. One frame.
              </p>
              <Link
                href="/projects/elissa-live-stage"
                className="link-draw label mt-8 inline-block text-ivory/80 hover:text-ivory"
              >
                See the full sequence
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ACT VI — the filmstrip */}
      <section className="bg-noir py-32 md:py-48">
        <div className="mx-auto max-w-[1680px] px-6 md:px-12">
          <Reveal>
            <div className="flex items-baseline justify-between">
              <h2 className="display text-4xl text-ivory md:text-5xl">Selected frames</h2>
              <Link href="/portfolio" className="link-draw label hidden text-smoke hover:text-ivory md:inline">
                View all
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="filmstrip mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 md:mt-20 md:gap-8 md:px-12">
          {[
            photos.couplePortrait,
            photos.celebrationLift,
            photos.denimEditorial,
            photos.elissaSpotlight,
            photos.profileStudy,
            photos.furPortrait,
            photos.elissaBackstage,
          ].map((photo, i) => (
            <div
              key={photo.id}
              className={`w-[72vw] shrink-0 snap-start sm:w-[44vw] md:w-[30vw] lg:w-[24vw] ${
                i % 2 === 1 ? "md:mt-16" : ""
              }`}
            >
              <PhotoFigure
                photo={photo}
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 30vw, 72vw"
              />
            </div>
          ))}
          <div className="w-[24vw] shrink-0 snap-start" aria-hidden />
        </div>
        <div className="mt-10 px-6 md:hidden">
          <Link href="/portfolio" className="link-draw label text-smoke">
            View all
          </Link>
        </div>
      </section>

      {/* ACT VII — projects index */}
      <section className="border-t border-line-dark bg-noir px-6 py-32 md:px-12 md:py-44">
        <div className="mx-auto max-w-[1680px]">
          <Reveal>
            <p className="label text-champagne">Featured projects</p>
            <h2 className="display mt-6 text-4xl text-ivory md:text-5xl">
              Stories with their own atmosphere.
            </h2>
          </Reveal>
          <div className="mt-16 md:mt-24">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.05}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group grid items-center gap-6 border-t border-line-dark py-10 transition-colors duration-500 last:border-b md:grid-cols-12 md:py-12"
                >
                  <span className="label text-smoke-dark md:col-span-1">
                    0{i + 1}
                  </span>
                  <span className="display text-3xl text-ivory transition-colors duration-500 group-hover:text-champagne md:col-span-6 md:text-4xl">
                    {project.title}
                  </span>
                  <span className="label text-smoke md:col-span-3">
                    {project.category} · {project.year}
                  </span>
                  <span className="hidden justify-self-end md:col-span-2 md:block">
                    <span className="frame block w-28 overflow-hidden opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                      <Image
                        src={project.hero.src}
                        alt=""
                        width={project.hero.width}
                        height={project.hero.height}
                        sizes="112px"
                        className="h-auto w-full"
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="A date only holds one wedding."
        body="Share the place, the date and the feeling. You will receive availability, approach and a tailored proposal."
        href="/booking"
        cta="Check Your Date"
      />
    </>
  );
}
