"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { allPhotos, type Photo, type PhotoCategory } from "@/lib/photos";
import { EASE } from "@/components/motion";

const filters = ["All", "Weddings", "Portraits", "Events", "Commercial"] as const;
type Filter = (typeof filters)[number];

/** Rows cycle A (duet) → B (solo moment) → C (trio) so the page reads like a magazine, not a grid. */
type Row =
  | { kind: "duet"; items: Photo[] }
  | { kind: "solo"; items: Photo[] }
  | { kind: "trio"; items: Photo[] };

function composeRows(items: Photo[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  let step = 0;
  while (i < items.length) {
    const kind = (["duet", "solo", "trio"] as const)[step % 3];
    const take = kind === "duet" ? 2 : kind === "solo" ? 1 : 3;
    rows.push({ kind, items: items.slice(i, i + take) });
    i += take;
    step += 1;
  }
  return rows;
}

function Frame({
  photo,
  sizes,
  className,
  eager = false,
}: {
  photo: Photo;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <figure className={className}>
      <div className="frame">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <span className="text-sm font-normal text-ivory/90">{photo.title}</span>
        <span className="label shrink-0 text-smoke-dark">{photo.location}</span>
      </figcaption>
    </figure>
  );
}

export default function PortfolioGallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const reduce = useReducedMotion();

  const rows = useMemo(() => {
    const items =
      filter === "All"
        ? allPhotos
        : allPhotos.filter((p) => p.category === (filter as PhotoCategory));
    return composeRows(items);
  }, [filter]);

  return (
    <div className="mx-auto max-w-[1680px] px-6 pb-32 md:px-12 md:pb-48">
      <div
        role="group"
        aria-label="Filter portfolio by category"
        className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line-dark pt-8"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`label transition-colors duration-500 ${
              filter === f ? "text-champagne" : "text-smoke hover:text-ivory"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-20 space-y-24 md:mt-28 md:space-y-40"
        >
          {rows.map((row, r) => {
            if (row.kind === "duet") {
              const [a, b] = row.items;
              return (
                <div key={r} className="grid gap-x-8 gap-y-16 md:grid-cols-12">
                  {a && (
                    <Frame
                      photo={a}
                      eager={r === 0}
                      sizes="(min-width: 768px) 56vw, 100vw"
                      className="md:col-span-7"
                    />
                  )}
                  {b && (
                    <Frame
                      photo={b}
                      sizes="(min-width: 768px) 32vw, 100vw"
                      className="md:col-span-4 md:col-start-9 md:mt-32"
                    />
                  )}
                </div>
              );
            }
            if (row.kind === "solo") {
              const [a] = row.items;
              return a ? (
                <div key={r} className="grid md:grid-cols-12">
                  <Frame
                    photo={a}
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className={`md:col-span-6 ${r % 2 ? "md:col-start-2" : "md:col-start-6"}`}
                  />
                </div>
              ) : null;
            }
            return (
              <div key={r} className="grid gap-x-8 gap-y-16 md:grid-cols-12">
                {row.items[0] && (
                  <Frame
                    photo={row.items[0]}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="md:col-span-4"
                  />
                )}
                {row.items[1] && (
                  <Frame
                    photo={row.items[1]}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="md:col-span-4 md:mt-24"
                  />
                )}
                {row.items[2] && (
                  <Frame
                    photo={row.items[2]}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="md:col-span-4 md:mt-12"
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
