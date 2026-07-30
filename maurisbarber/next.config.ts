import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // pdfkit reads its standard-font .afm files from disk at runtime using
  // relative paths, and nodemailer relies on Node built-ins (stream, etc.);
  // bundling either with webpack breaks them, so both must run as plain Node
  // requires from node_modules instead — this matters especially for
  // instrumentation.ts, which Next also tries to bundle edge-safe by default.
  serverExternalPackages: ["pdfkit", "nodemailer"],
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
