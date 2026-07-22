"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Privacy-first page-view ping — no cookies, nothing identifying stored. */
export default function Beacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || navigator.webdriver) return;
    fetch("/api/beacon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
