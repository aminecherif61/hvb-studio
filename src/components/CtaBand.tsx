import Link from "next/link";
import { Reveal } from "./motion";

export default function CtaBand({
  kicker = "Availability",
  title,
  body,
  href,
  cta,
  tone = "dark",
}: {
  kicker?: string;
  title: string;
  body?: string;
  href: string;
  cta: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <section
      className={`${dark ? "bg-noir text-ivory" : "bg-ivory text-noir"} border-t ${
        dark ? "border-line-dark" : "border-line-light"
      }`}
    >
      <div className="mx-auto max-w-[1680px] px-6 py-28 text-center md:px-12 md:py-40">
        <Reveal>
          <p className={`label ${dark ? "text-champagne" : "text-smoke-dark"}`}>{kicker}</p>
          <h2 className="display mx-auto mt-6 max-w-3xl text-4xl md:text-6xl">{title}</h2>
          {body && (
            <p
              className={`mx-auto mt-6 max-w-xl text-sm leading-relaxed md:text-base ${
                dark ? "text-smoke" : "text-smoke-dark"
              }`}
            >
              {body}
            </p>
          )}
          <Link
            href={href}
            className={`label mt-12 inline-block border px-10 py-4 transition-colors duration-500 ${
              dark
                ? "border-ivory/30 text-ivory hover:border-champagne hover:text-champagne"
                : "border-noir/30 text-noir hover:border-noir hover:bg-noir hover:text-ivory"
            }`}
          >
            {cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
