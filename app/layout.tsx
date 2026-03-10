import type { Metadata } from "next"
import { Inter } from "next/font/google"
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SEO_KEYWORDS,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

/**
 * Stage 1: Build strongly-typed global SEO metadata for every publicly indexable route.
 *
 * Why this exists:
 * - Establishes canonical defaults for title, description, and social previews.
 * - Gives crawlers high-confidence identity signals (publisher, category, locale).
 * - Keeps metadata stable across static and dynamic rendering modes.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  /**
   * Stage 1.1: Strengthen social discoverability with Open Graph + Twitter cards.
   */
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: toAbsoluteUrl("/icon.svg"),
        width: 512,
        height: 512,
        alt: "e-yar logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [toAbsoluteUrl("/icon.svg")],
  },

  /**
   * Stage 1.2: Provide robots defaults for indexable marketing pages.
   * Private areas override this with route-level noindex metadata.
   */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /**
   * Stage 1.3: Keep favicon and touch icon metadata explicit and deterministic.
   */
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  /**
   * Stage 1.4: Support Google Search Console verification via environment variable.
   * Safe even when unset because undefined values are ignored.
   */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /**
   * Stage 2: Publish schema.org JSON-LD for richer SERP understanding.
   *
   * Why this exists:
   * - Website + SoftwareApplication schema improves semantic clarity for crawlers.
   * - Structured data helps search engines classify brand, product type, and URL graph.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: BRAND_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-GB",
      },
      {
        "@type": "SoftwareApplication",
        name: BRAND_NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "Organization",
        name: BRAND_NAME,
        url: SITE_URL,
        logo: toAbsoluteUrl("/icon.svg"),
      },
    ],
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  )
}
