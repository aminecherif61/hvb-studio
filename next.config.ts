import type { NextConfig } from "next";

// Security headers set at the framework level so they apply to every route,
// including server-rendered and prerendered HTML (netlify.toml [[headers]] only
// reach static assets reliably under the Next.js runtime). Long-cache headers
// for /_next/static and /images stay in netlify.toml.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

// Public pages are statically rendered, so their CSP cannot use nonces —
// 'unsafe-inline' for scripts is required by Next's hydration bootstrap.
// Vault pages get a strict nonce + strict-dynamic CSP from the middleware
// instead, which is why they are excluded from this header.
const publicCsp = [
  "default-src 'self'",
  // 'unsafe-eval' is dev-only: webpack evaluates modules with eval() there.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/((?!vault|api).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
    ];
  },
};

export default nextConfig;
