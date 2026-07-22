"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "./api";
import { VEASE } from "./ui";

const NAV = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/settings", label: "Security" },
  { href: "/admin/blog", label: "Blog" },
];

const REFRESH_EVERY_MS = 8 * 60_000; // access token lives 10 min
const IDLE_LOGOUT_MS = 30 * 60_000; // mirror of the server idle window

export default function Shell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const lastActivity = useRef(Date.now());

  const logout = useCallback(async () => {
    await api("/api/vault/auth/logout").catch(() => undefined);
    router.replace("/admin");
  }, [router]);

  // Session keeper: silent refresh while active; hard logout after idling.
  useEffect(() => {
    const markActivity = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "visibilitychange"] as const;
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));

    const tick = setInterval(async () => {
      if (Date.now() - lastActivity.current > IDLE_LOGOUT_MS) {
        await logout();
        return;
      }
      api("/api/vault/auth/refresh").catch(() => router.replace("/admin"));
    }, REFRESH_EVERY_MS);

    return () => {
      clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, markActivity));
    };
  }, [logout, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Vault" className="space-y-1">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative block rounded-xl px-4 py-2.5 text-sm transition-colors duration-300 ${
              active ? "text-[#f3eee6]" : "text-smoke hover:text-ivory"
            }`}
          >
            {active && (
              <motion.span
                layoutId="vault-nav-pill"
                className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col justify-between border-r border-white/[0.07] p-6 lg:flex">
        <div>
          <Link href="/admin/overview" className="mb-10 block px-2">
            <Image
              src="/images/hamdi/brand/hvb-monogram-ivory.png"
              alt="HVB Studio"
              width={800}
              height={258}
              sizes="110px"
              className="h-8 w-auto opacity-90"
            />
            <span className="label mt-2 block text-[0.56rem] text-smoke-dark">The Vault</span>
          </Link>
          {nav}
        </div>
        <div className="space-y-4 px-2">
          <p className="truncate text-xs text-smoke-dark" title={email}>
            {email}
          </p>
          <button onClick={logout} className="link-draw label text-smoke hover:text-ivory">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-[#09090b]/85 px-5 py-4 backdrop-blur-md lg:hidden">
        <Link href="/admin/overview">
          <Image
            src="/images/hamdi/brand/hvb-monogram-ivory.png"
            alt="HVB Studio"
            width={800}
            height={258}
            sizes="90px"
            className="h-6 w-auto"
          />
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="label text-ivory"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>
      {menuOpen && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: VEASE }}
          className="fixed inset-0 z-30 bg-[#09090b]/97 px-6 pb-10 pt-24 backdrop-blur-lg lg:hidden"
        >
          {nav}
          <button onClick={logout} className="link-draw label mt-8 px-4 text-smoke">
            Sign out
          </button>
        </motion.div>
      )}

      <main className="vault-scroll min-w-0 flex-1 px-5 pb-20 pt-24 md:px-10 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
