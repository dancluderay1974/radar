import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  // Stage 1: Preserve existing SEO metadata for title and description.
  title: "e-yar | AI-Powered App Builder",
  description: "Build and deploy applications with AI assistance. Connect your GitHub repos and let AI help you code.",

  // Stage 2: Point browser tab icon metadata to the new custom code favicon.
  // Why: Explicit icon metadata ensures the intended icon is used consistently.
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {/*
          Stage 3: Render children directly without a global client SessionProvider.

          Why this exists:
          - The login page is fully client-rendered and previously mounted SessionProvider globally.
          - SessionProvider eagerly calls `/api/auth/session` on mount.
          - If auth environment variables are temporarily misconfigured in production,
            that eager request can fail and spam the browser console before user interaction.

          The app already authorizes protected areas with server-side `auth()` checks,
          so removing the global provider keeps login UX quiet while preserving security.
        */}
        {children}
      </body>
    </html>
  )
}
