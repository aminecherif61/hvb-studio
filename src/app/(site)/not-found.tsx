import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center bg-noir px-6 text-center">
      <p className="label text-smoke-dark">404</p>
      <h1 className="display mt-6 text-4xl text-ivory md:text-6xl">
        This frame doesn&apos;t exist.
      </h1>
      <Link
        href="/"
        className="label mt-12 border border-ivory/30 px-8 py-4 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne"
      >
        Back to the work
      </Link>
    </section>
  );
}
