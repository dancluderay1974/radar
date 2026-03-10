import type { MetadataRoute } from "next"
import { toAbsoluteUrl } from "@/lib/seo"

/**
 * Stage 1: Publish a concise XML sitemap for indexable marketing/legal pages.
 *
 * Why this exists:
 * - Helps search engines discover canonical URLs quickly.
 * - Excludes authenticated/private surfaces that should not rank.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: toAbsoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ]
}
