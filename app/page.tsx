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
              AI Web Development, Yorkshire Style
            </div>
            
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
              Reet Proper AI
              <br />
              <span className="text-muted-foreground">for building websites.</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
              When t&apos;server&apos;s sulking and there&apos;s trouble at mill, e-yar helps you build,
              fix, and ship websites without all t&apos;faff. Tell it what you want in plain English,
              and it gets cracking.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  Get It Sorted
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                See It Working
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                Everything You Need, Nowt You Don&apos;t
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                A reet practical AI toolkit for building websites quickly, cleanly, and without
                endless config nonsense.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<GitBranch className="h-6 w-6" />}
                title="GitHub, Properly Connected"
                description="Link your repos, pull code, and push changes straight from t&apos;platform. No messing about."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="AI That Writes The Boring Bits"
                description="Tell it what you need. It writes tidy code. You review it, tweak it, and crack on."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Live Preview"
                description="See changes straight away. If summat&apos;s off, you&apos;ll spot it before it causes trouble at mill."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Three simple steps and you&apos;re building websites faster than a brew goes cold.
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                number="01"
                title="Connect Your Repository"
                description="Link GitHub and pick the repo you want to sort."
              />
              <StepCard
                number="02"
                title="Tell It What You Need"
                description="Describe your page or feature in plain English."
              />
              <StepCard
                number="03"
                title="Review and Ship"
                description="Check the output, make tweaks, and deploy when it&apos;s reet proper job."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-foreground py-24 text-background">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Right Then, Let&apos;s Build Summat
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-background/70">
              Stop fighting broken builds and tut development server. Let AI handle the faff so
              you can get back to proper dev work.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Start Building
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
              Built with Yorkshire stubbornness. Less nonsense. More working software.
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
