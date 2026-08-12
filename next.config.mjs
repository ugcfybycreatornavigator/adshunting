/** @type {import('next').NextConfig} */
const nextConfig = {
  // npm scripts assign a distinct output directory to dev and production.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async redirects() {
    return process.env.DEV_BYPASS_AUTH === "true"
      ? [{ source: "/login", destination: "/dashboard", permanent: false }]
      : [];
  },
};

export default nextConfig;
