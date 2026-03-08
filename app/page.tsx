import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, GitBranch, Sparkles, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Code2 className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold tracking-tight">e-yar</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              AI-Powered Development
            </div>
            
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
              Build apps with AI,
              <br />
              <span className="text-muted-foreground">not just code.</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
              Connect your GitHub repositories and let AI help you build, edit, and deploy 
              your applications. Describe what you want in plain English and watch it come to life.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                Everything you need to build faster
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                A complete development environment powered by AI that understands your codebase.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<GitBranch className="h-6 w-6" />}
                title="GitHub Integration"
                description="Connect your repositories, pull code, and push changes directly from the platform."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="AI Code Generation"
                description="Describe features in plain English. AI writes the code, you review and approve."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Live Preview"
                description="See your changes in real-time with hot module replacement and instant feedback."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Three simple steps to transform your development workflow.
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                number="01"
                title="Connect Repository"
                description="Link your GitHub account and select the repository you want to work with."
              />
              <StepCard
                number="02"
                title="Describe Changes"
                description="Tell the AI what you want to build or change using natural language."
              />
              <StepCard
                number="03"
                title="Review & Deploy"
                description="Preview the changes, approve them, and push directly to your repository."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-foreground py-24 text-background">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to build smarter?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-background/70">
              Join developers who are already using AI to accelerate their workflow.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <Code2 className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">e-yar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for developers who want to move fast.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground text-lg font-bold">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
