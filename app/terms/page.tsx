import type { Metadata } from "next"
import Link from "next/link"

/**
 * Stage 0: Define explicit page metadata for legal route discoverability.
 *
 * Why this exists:
 * - Adds focused legal-page metadata for better SERP clarity.
 * - Ensures canonical URL consistency with global SEO configuration.
 */
export const metadata: Metadata = {
  title: "Terms of Service | e-yar",
  description: "Review the terms governing access and usage of the e-yar platform.",
  alternates: {
    canonical: "/terms",
  },
}


/**
 * Stage 1: Define a minimal Terms page for the login footer links.
 *
 * Why this exists:
 * - The login page prefetches `/terms` when the link enters viewport.
 * - Missing route files cause avoidable 404 errors in the browser console.
 * - Providing this route removes noisy navigation/prefetch errors.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">
        These terms govern access to and use of e-yar. By using the service, you agree to follow
        all applicable laws and platform policies.
      </p>
      <p className="text-sm text-muted-foreground">
        We may update these terms as the product evolves. Continued use of the service after an
        update means you accept the revised terms.
      </p>
      <Link href="/login" className="text-sm underline hover:text-foreground">
        Back to login
      </Link>
    </main>
  )
}
