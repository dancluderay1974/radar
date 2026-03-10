/**
 * Stage 1: Define SEO primitives in one file so metadata stays consistent across routes.
 *
 * Why this exists:
 * - Root metadata, robots, sitemap, and page-level metadata should all agree on canonical URL.
 * - Centralizing these values avoids subtle SEO drift when pages evolve.
 * - This module is server-safe and contains no client-only APIs.
 */

/**
 * Stage 1.1: Resolve the canonical site origin from environment variables.
 *
 * Priority order:
 * 1) NEXT_PUBLIC_SITE_URL (explicit public canonical URL)
 * 2) NEXTAUTH_URL (already present in this project for auth callbacks)
 * 3) Production fallback for e-yar
 */
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://e-yar.com"

/**
 * Stage 1.2: Normalize URL formatting by removing trailing slashes.
 *
 * Why:
 * - Canonical and Open Graph URLs should be stable and slash-consistent.
 * - Normalization prevents duplicate URL variants from being indexed separately.
 */
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "")

/**
 * Stage 1.3: Provide first-class brand constants reused by metadata generators.
 */
export const BRAND_NAME = "e-yar"
export const DEFAULT_TITLE = "e-yar | AI-Powered App Builder"
export const DEFAULT_DESCRIPTION =
  "Build, iterate, and deploy production-ready web applications with AI assistance and GitHub-native workflows."

/**
 * Stage 1.4: Publish a broad but relevant keyword set for long-tail discoverability.
 *
 * Why:
 * - Modern search engines do not heavily weight keywords meta tags alone,
 *   but this list remains useful as machine-readable topical context.
 */
export const SEO_KEYWORDS = [
  "AI app builder",
  "AI web development",
  "AI coding assistant",
  "GitHub AI tools",
  "website builder",
  "Next.js AI platform",
  "automated code generation",
  "developer productivity",
  "AI software development",
  "e-yar",
]

/**
 * Stage 1.5: Build absolute URLs from local route paths.
 *
 * @param path - Route path beginning with `/`.
 * @returns Fully-qualified canonical URL for SEO fields.
 */
export function toAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}
