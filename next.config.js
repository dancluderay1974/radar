/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// Cloudflare Pages dev platform setup - only runs in development
if (process.env.NODE_ENV === "development") {
  import("@cloudflare/next-on-pages/next-dev").then(({ setupDevPlatform }) => {
    setupDevPlatform()
  }).catch(() => {
    // Ignore if not available (e.g., not deployed to Cloudflare)
  })
}

module.exports = nextConfig
