import Image from "next/image";
import type { Photo } from "@/lib/photos";
import { ImageReveal } from "./motion";

/**
 * A photograph with its museum plaque. `sizes` should describe the widest
 * the image ever renders so srcset selection stays honest.
 */
export default function PhotoFigure({
  photo,
  sizes,
  caption,
  priority = false,
  className,
  plaque = true,
  tone = "dark",
}: {
  photo: Photo;
  sizes: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  plaque?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <figure className={className}>
      <ImageReveal className="frame">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full object-cover"
        />
      </ImageReveal>
      {plaque && (
        <figcaption className="mt-4 flex items-baseline justify-between gap-4">
          <span
            className={`text-sm ${tone === "dark" ? "text-ivory/90" : "text-noir"} font-normal`}
          >
            {caption ?? photo.title}
          </span>
          <span className={`label shrink-0 ${tone === "dark" ? "text-smoke-dark" : "text-smoke-dark"}`}>
            {photo.location}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
