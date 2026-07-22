import Image from "next/image";

/**
 * The HVB Studio monogram. Two pre-tinted assets share one alpha mask:
 * `ivory` for dark surfaces, `noir` for the ivory gallery sections.
 */
export default function Logo({
  variant = "ivory",
  className,
  priority = false,
  sizes = "160px",
}: {
  variant?: "ivory" | "noir";
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={`/images/hamdi/brand/hvb-monogram-${variant}.png`}
      alt="HVB Studio"
      width={800}
      height={258}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
