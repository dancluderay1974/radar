export const runtime = "edge"

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard/nav"

/**
 * Stage 0: Prevent private dashboard routes from appearing in search results.
 *
 * Why this exists:
 * - Dashboard pages require authentication and are not public marketing content.
 * - noindex/nofollow protects crawl budget and avoids leaking private URLs into SERPs.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

/**
 * Stage 1: Gate all dashboard sub-routes behind a server-side auth check.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={session.user} />
      <main>{children}</main>
    </div>
  )
}
