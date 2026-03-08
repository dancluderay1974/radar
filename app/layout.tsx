import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "e-yar | AI-Powered App Builder",
  description: "Build and deploy applications with AI assistance. Connect your GitHub repos and let AI help you code.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
