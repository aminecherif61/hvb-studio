"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { EASE } from "./motion";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/hvb-weddings", label: "Weddings" },
  { href: "/hvb-studio", label: "Studio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // The Studio page is the only route that opens on an ivory surface. Everywhere
  // else the top of the page is a dark hero. Once scrolled, the bar turns noir on
  // every route — so the mark and nav go light again.
  const lightContext = pathname === "/hvb-studio" && !scrolled && !open;

  const navTone = lightContext ? "text-noir/60 hover:text-noir" : "text-ivory/60 hover:text-ivory";
  const navActive = lightContext ? "text-noir" : "text-ivory";

  return (
    <>
      {/* Background bar — a separate fixed layer that fades in on scroll */}
      <div
        aria-hidden
        className={`fixed inset-x-0 top-0 z-40 h-20 border-b transition-[background-color,border-color,opacity] duration-700 md:h-24 ${
          scrolled && !open
            ? "border-line-dark bg-noir/85 backdrop-blur-md"
            : "border-transparent opacity-0"
        }`}
      />
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-[1680px] items-center justify-between px-6 md:h-24 md:px-12">
          <Link href="/" className="group flex items-center" aria-label="HVB Studio — home">
            <Logo
              variant={lightContext ? "noir" : "ivory"}
              priority
              sizes="(min-width: 768px) 150px, 124px"
              className="h-8 w-auto transition-opacity duration-500 group-hover:opacity-80 md:h-10"
            />
            <span className="sr-only">Hamdi Van Buuren — HVB Studio and HVB Weddings</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`link-draw label transition-colors duration-500 ${
                  pathname === item.href ? navActive : navTone
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className={`label border px-6 py-3 transition-colors duration-500 ${
                lightContext
                  ? "border-noir/30 text-noir hover:border-noir"
                  : "border-ivory/40 text-ivory hover:border-ivory"
              }`}
            >
              Book
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className={`label flex h-11 items-center gap-3 lg:hidden ${
              open ? "text-ivory" : lightContext ? "text-noir" : "text-ivory"
            }`}
          >
            {open ? "Close" : "Menu"}
            <span className="flex w-6 flex-col gap-1.5" aria-hidden>
              <span
                className={`h-px bg-current transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px bg-current transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-noir px-6 pb-14 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/booking", label: "Book a Session" }].map(
                (item, i) => (
                  <span key={item.href} className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={reduce ? false : { y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        className={`display block py-2 text-4xl ${
                          pathname === item.href ? "text-champagne" : "text-ivory"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.span>
                  </span>
                ),
              )}
            </nav>
            <motion.p
              className="label mt-10 text-smoke"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Tunis · International commissions
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
