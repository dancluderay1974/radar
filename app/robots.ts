import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

/**
 * Stage 1: Generate a robots.txt policy tailored for public marketing discovery.
 *
 * Why this exists:
 * - Explicitly allows crawling of public pages.
 * - Explicitly blocks private dashboard and auth endpoints from indexation.
 * - Points bots to sitemap for faster URL discovery.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        disallow: ["/dashboard", "/login", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
