/**
 * Stage 1: Mark the login route as non-indexable.
 *
 * Why this exists:
 * - Authentication pages should not appear in search results.
 * - This avoids low-quality indexed pages and preserves crawl budget for public content.
 */
export default function Head() {
  return (
    <>
      <meta name="robots" content="noindex,nofollow,noarchive" />
    </>
  )
}
