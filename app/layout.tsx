import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
