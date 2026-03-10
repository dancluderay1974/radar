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
  title: "Privacy Policy | e-yar",
  description: "Read how e-yar handles account, authentication, and repository-related data.",
  alternates: {
    canonical: "/privacy",
  },
}


/**
 * Stage 1: Define a minimal Privacy page for the login footer links.
 *
 * Why this exists:
 * - The login page prefetches `/privacy` when the link enters viewport.
 * - Missing route files cause avoidable 404 errors in the browser console.
 * - Providing this route removes noisy navigation/prefetch errors.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        e-yar stores only the data required to authenticate you and power repository-related
        features. We do not sell personal data.
      </p>
      <p className="text-sm text-muted-foreground">
        You can request account and data removal by contacting support. We will process requests
        according to legal and operational requirements.
      </p>
      <Link href="/login" className="text-sm underline hover:text-foreground">
        Back to login
      </Link>
    </main>
  )
}
