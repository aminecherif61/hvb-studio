import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, nextProject, projects } from "@/lib/projects";
import { HeroDrift, Reveal, StaggerLines } from "@/components/motion";
import PhotoFigure from "@/components/PhotoFigure";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.story };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = nextProject(slug);

  return (
    <>
      {/* hero */}
      <section className="relative h-[92svh] overflow-hidden bg-noir">
        <HeroDrift className="absolute inset-0">
          <Image
            src={project.hero.src}
            alt={project.hero.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_40%]"
          />
        </HeroDrift>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/20 to-noir/40" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12 md:pb-20">
          <div className="mx-auto max-w-[1680px]">
            <Reveal delay={0.7} y={10}>
              <p className="label text-ivory/70">
                {project.category} · {project.location} · {project.year}
              </p>
            </Reveal>
            <h1 className="display mt-5 max-w-4xl text-[10vw] text-ivory sm:text-6xl md:text-7xl">
              <StaggerLines delay={0.8} lines={[project.title]} />
            </h1>
          </div>
        </div>
      </section>

      {/* story + meta */}
      <section className="bg-noir px-6 py-28 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-16 md:grid-cols-12">
            <Reveal className="md:col-span-6 md:col-start-2">
              <p className="label text-champagne">The story</p>
              <p className="display mt-8 text-2xl leading-[1.25] text-ivory md:text-4xl md:leading-[1.2]">
                {project.story}
              </p>
            </Reveal>
            <Reveal delay={0.15} className="md:col-span-3 md:col-start-10">
              <dl className="space-y-8 border-t border-line-dark pt-8">
                {[
                  ["Client", project.client],
                  ["Location", project.location],
                  ["Year", project.year],
                  ["Approach", project.technical],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="label text-smoke-dark">{term}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ivory/85">{detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* the sequence */}
      <section className="bg-noir px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px] space-y-28 md:space-y-44">
          {project.sequence.map((frame, i) => {
            const layout = i % 3;
            return (
              <div key={`${frame.photo.id}-${i}`} className="grid items-end gap-x-8 gap-y-6 md:grid-cols-12">
                <div
                  className={
                    layout === 0
                      ? "md:col-span-7 md:col-start-1"
                      : layout === 1
                        ? "md:col-span-6 md:col-start-6"
                        : "md:col-span-5 md:col-start-3"
                  }
                >
                  <PhotoFigure
                    photo={frame.photo}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    plaque={false}
                  />
                </div>
                <Reveal
                  delay={0.1}
                  className={
                    layout === 1
                      ? "md:col-span-3 md:col-start-2 md:row-start-1 md:pb-4 md:text-right"
                      : "md:col-span-3 md:pb-4"
                  }
                >
                  <p className="label text-smoke-dark">
                    {String(i + 1).padStart(2, "0")} · {frame.beat}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* next project */}
      <section className="border-t border-line-dark bg-noir">
        <Link
          href={`/projects/${next.slug}`}
          className="group mx-auto block max-w-[1680px] px-6 py-24 md:px-12 md:py-36"
        >
          <Reveal>
            <p className="label text-smoke-dark">Next story</p>
            <span className="display mt-6 block text-5xl text-ivory transition-colors duration-500 group-hover:text-champagne md:text-7xl">
              {next.title}
            </span>
            <span className="label mt-6 inline-block text-smoke">
              {next.category} · {next.year} →
            </span>
          </Reveal>
        </Link>
      </section>
    </>
  );
}
