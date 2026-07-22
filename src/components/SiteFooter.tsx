import Link from "next/link";
import Logo from "./Logo";

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/portfolio", label: "Portfolio" },
      { href: "/hvb-weddings", label: "HVB Weddings" },
      { href: "/hvb-studio", label: "HVB Studio" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Inquiries",
    links: [
      { href: "/booking", label: "Book a Session" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Instagram",
    links: [
      {
        href: "https://www.instagram.com/hamdi_van_buuren/",
        label: "@hamdi_van_buuren",
        external: true,
      },
      {
        href: "https://www.instagram.com/hvb_weddings/",
        label: "@hvb_weddings",
        external: true,
      },
      {
        href: "https://www.instagram.com/hvbstudio/",
        label: "@hvbstudio",
        external: true,
      },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line-dark bg-noir">
      <div className="mx-auto max-w-[1680px] px-6 pb-12 pt-20 md:px-12 md:pt-28">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="ivory" sizes="200px" className="h-11 w-auto md:h-12" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-smoke">
              Photography and visual storytelling from Tunis — weddings, portraits,
              brands and live stages by Hamdi Van Buuren.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="label text-smoke-dark">{col.heading}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw text-sm text-ivory/80 hover:text-ivory"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="link-draw text-sm text-ivory/80 hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-20 flex flex-col gap-3 border-t border-line-dark pt-8 md:flex-row md:items-center md:justify-between">
          <p className="label text-smoke-dark">
            © {new Date().getFullYear()} Hamdi Van Buuren
          </p>
          <p className="label text-smoke-dark">Tunis · International commissions</p>
        </div>
      </div>
    </footer>
  );
}
