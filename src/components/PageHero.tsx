import { Reveal, StaggerLines } from "./motion";

/** Interior-page opening: kicker, display headline, standfirst. */
export default function PageHero({
  kicker,
  lines,
  standfirst,
  tone = "dark",
}: {
  kicker: string;
  lines: string[];
  standfirst?: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <section className={`${dark ? "bg-noir text-ivory" : "bg-ivory text-noir"} px-6 pb-16 pt-40 md:px-12 md:pb-24 md:pt-56`}>
      <div className="mx-auto max-w-[1680px]">
        <Reveal y={16}>
          <p className={`label ${dark ? "text-champagne" : "text-smoke-dark"}`}>{kicker}</p>
        </Reveal>
        <h1 className="display mt-8 text-[13vw] leading-[0.98] sm:text-6xl md:text-7xl lg:text-8xl">
          <StaggerLines lines={lines} delay={0.15} />
        </h1>
        {standfirst && (
          <Reveal delay={0.5} y={18}>
            <p
              className={`mt-10 max-w-xl text-base leading-relaxed md:text-lg ${
                dark ? "text-smoke" : "text-smoke-dark"
              }`}
            >
              {standfirst}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
