import type { Metadata } from "next";

// Every vault page renders dynamically: the middleware injects a per-request
// CSP nonce and auth state lives in cookies — nothing here may be static.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "HVB Vault", template: "%s — HVB Vault" },
  robots: { index: false, follow: false },
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return <div className="vault">{children}</div>;
}
