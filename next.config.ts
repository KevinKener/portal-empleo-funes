import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// The browser talks to Supabase directly only for file uploads (Vercel caps
// request bodies, see src/lib/archivos.ts); everything else goes through our server.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// CSP without nonces (Next.js guide "content-security-policy"): nonces would
// force every page to render dynamically. 'unsafe-eval' is only for dev tooling.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${supabase}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Nobody may frame the portal: blocks clickjacking on /ingresar and the forms
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
