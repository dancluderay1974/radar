"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Github, Loader2 } from "lucide-react"

const MAIN_DOMAIN = "https://e-yar.com"

/**
 * Step 1: Render the shared login shell so the page keeps a stable layout
 * while the client-only search param state is resolving under Suspense.
 */
function LoginShell({
  isLoading,
  onSignIn,
}: {
  isLoading: boolean
  onSignIn: () => Promise<void>
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
          <Code2 className="h-6 w-6 text-background" />
        </div>
        <span className="text-2xl font-semibold tracking-tight">e-yar</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to e-yar</CardTitle>
          <CardDescription>
            Sign in with GitHub to connect your repositories and start building with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onSignIn} className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Why GitHub?</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground" />
              Access your repositories directly
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground" />
              Pull, edit, and push code seamlessly
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground" />
              AI understands your codebase context
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}

/**
 * Step 2: Read URL search params inside a Suspense-enabled component.
 * Next.js requires useSearchParams to live under a Suspense boundary during prerender.
 */
function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  /**
   * Step 2.1: Defensively read the redirect parameter.
   * In mixed router compatibility scenarios, Next.js can type searchParams as nullable.
   * Optional chaining keeps the auth flow safe during prerender and strict type checking.
   */
  const redirectUrl = searchParams?.get("redirect")

  /**
   * Step 3: Normalize auth redirect behavior between custom domains and the main domain.
   */
  const handleGitHubSignIn = async () => {
    setIsLoading(true)

    const currentHost = typeof window !== "undefined" ? window.location.origin : ""
    const isMainDomain = currentHost.includes("e-yar.com")

    if (!isMainDomain && !redirectUrl) {
      const returnUrl = encodeURIComponent(currentHost + "/dashboard")
      window.location.href = `${MAIN_DOMAIN}/login?redirect=${returnUrl}`
      return
    }

    const callbackUrl = redirectUrl || "/dashboard"
    await signIn("github", { callbackUrl })
  }

  return <LoginShell isLoading={isLoading} onSignIn={handleGitHubSignIn} />
}

/**
 * Step 4: Provide a resilient page-level Suspense boundary so static generation succeeds.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell isLoading={false} onSignIn={async () => undefined} />}>
      <LoginPageContent />
    </Suspense>
  )
}
