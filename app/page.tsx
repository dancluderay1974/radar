"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Compass, Focus, GitBranch, Sparkles, Target, Zap } from "lucide-react"

type LandingCopy = {
  badge: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  primaryCta: string
  purposeTitle: string
  purposeSubtitle: string
  purposeDescription: string
  purposePoints: Array<{ title: string; description: string }>
  featureTitle: string
  featureDescription: string
  features: Array<{ title: string; description: string }>
  howItWorksDescription: string
  steps: Array<{ title: string; description: string }>
  ctaTitle: string
  ctaDescription: string
  footerTagline: string
}

/**
 * TranslationSwitchProps describes the reusable switch interface.
 * Step 1: Keep the control API explicit so desktop/mobile wrappers stay simple and consistent.
 */
type TranslationSwitchProps = {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  compact?: boolean
}

/**
 * Step 2: Define both copy variants in one map so every section toggles consistently.
 * Why: keeping translations side-by-side makes this feature easy to update and review.
 */

/**
 * Step 2.1: Define the rotating brand sequence for the header logo text.
 * Why: product wants a continuous GSAP-driven text loop every 3 seconds in one place.
 */
const ROTATING_BRAND_WORDS = ["e-yar", "found-it", "here it is", "it's here"] as const

const LANDING_COPY: Record<"yorkshire" | "english", LandingCopy> = {
  yorkshire: {
    badge: "AI Web Development, Yorkshire Style",
    heroTitle: "Reet Proper AI",
    heroSubtitle: "that knows why you're building.",
    heroDescription:
      "Go-to-market problem's still sat theer, nowt's shifted. Physics o't business rules ain't budged neither. Devs wander off an' lose t'plot on what actually matters an' what value's worth these days wi' all this turbo-charged AI about.\n\ne-yar keeps yer AI on t'straight an' narrow, by baking yer business purpose reyt into every line o' code it knocks up. Every feature knows why it exists. Every commit connects back to what yer business is actually trying to achieve.",
    primaryCta: "Get It Sorted",
    purposeTitle: "Code That Knows Its Job",
    purposeSubtitle: "Development for t'business, not just t'code.",
    purposeDescription:
      "Before any AI knocks up owt, it reads your rule book. What're we doing this for? How do we fetch brass? What does t'customer actually want? Every feature, every function, every commit knows reyt well why it's there an' what it's meant to do.",
    purposePoints: [
      {
        title: "Your Why, Baked In",
        description:
          "Enter your business goals once. AI reads 'em before every task. No more code that's technically grand but misses the point entirely.",
      },
      {
        title: "Developers Drift. This Doesn't.",
        description:
          "Left to their own devices, devs wander off track. e-yar keeps everyone building toward t'same goal, sprint after sprint.",
      },
      {
        title: "Git + Business Logic",
        description:
          "Pull, push, and ship code that's connected to your repos AND your revenue model. That's summat new.",
      },
    ],
    featureTitle: "Everything You Need, Nowt You Don't",
    featureDescription:
      "A reet practical AI toolkit for building websites quickly, cleanly, and without endless config nonsense.",
    features: [
      {
        title: "GitHub, Properly Connected",
        description:
          "Link your repos, pull code, and push changes straight from t'platform. No messing about.",
      },
      {
        title: "AI That Writes The Boring Bits",
        description:
          "Tell it what you need. It writes tidy code. You review it, tweak it, and crack on.",
      },
      {
        title: "Live Preview",
        description:
          "See changes straight away. If summat's off, you'll spot it before it causes trouble at mill.",
      },
    ],
    howItWorksDescription:
      "Three simple steps and you're building websites faster than a brew goes cold.",
    steps: [
      {
        title: "Connect t' GitHub",
        description: "Connect t' GitHub, pick your repo, and get cracking.",
      },
      {
        title: "Tell It What You Need",
        description: "Describe your page or feature in plain English.",
      },
      {
        title: "Review and Ship",
        description: "Check the output, make tweaks, and deploy when it's reet proper job.",
      },
    ],
    ctaTitle: "Right Then, Let's Build Summat",
    ctaDescription:
      "Stop fighting broken builds and tut development server. Let AI handle the faff so you can get back to proper dev work.",
    footerTagline:
      "Built with Yorkshire stubbornness. Less nonsense. More working software.",
  },
  english: {
    badge: "AI Web Development, Silicon Valley Style",
    heroTitle: "High-Performance AI",
    heroSubtitle: "that understands your business.",
    heroDescription:
      "The Go To Market problem hasn't been solved with AI. The physics of business hasn't changed. Developers drift and lose sight of goal and what value means in this era of supercharged AI development.\n\ne-yar keeps your AI aligned by embedding your business purpose into every line of code it generates. Every feature understands why it exists. Every commit traces back to the actual business outcome you're trying to achieve.",
    primaryCta: "Launch Now",
    purposeTitle: "Code That Ships With Intent",
    purposeSubtitle: "A development environment for the business, not just the codebase.",
    purposeDescription:
      "Before any AI writes a single line, it reads your playbook. What's the mission? How do you monetize? What does the customer actually need? Every feature, every function, every commit understands why it exists.",
    purposePoints: [
      {
        title: "Your Why, Embedded",
        description:
          "Define your business goals once. AI references them before every task. No more technically excellent code that completely misses the strategic point.",
      },
      {
        title: "Developers Drift. This Doesn't.",
        description:
          "Left unchecked, engineering teams lose alignment with business outcomes. e-yar maintains focus on the goals that actually matter, sprint after sprint.",
      },
      {
        title: "Git + Business Logic",
        description:
          "Pull, push, and ship code that's connected to your repositories AND your revenue model. That's a new paradigm.",
      },
    ],
    featureTitle: "Everything You Need, Nothing You Don't",
    featureDescription:
      "A practical AI toolkit for shipping websites quickly, cleanly, and without configuration drag.",
    features: [
      {
        title: "GitHub, Fully Integrated",
        description:
          "Connect repositories, pull code, and ship updates directly from the platform with a streamlined workflow.",
      },
      {
        title: "AI That Handles Boilerplate",
        description:
          "Describe the outcome. The AI generates clean implementation details so your team can focus on product decisions.",
      },
      {
        title: "Live Preview",
        description:
          "Review changes instantly, validate UX quickly, and catch issues before they impact release velocity.",
      },
    ],
    howItWorksDescription:
      "Three simple steps and your team is shipping websites faster with confidence.",
    steps: [
      {
        title: "Connect Your GitHub",
        description:
          "Connect GitHub, select your repository, and initialize your workflow in minutes.",
      },
      {
        title: "Define the Outcome",
        description: "Describe the page or feature in clear business language.",
      },
      {
        title: "Review and Deploy",
        description:
          "Validate the generated output, apply final refinements, and deploy when it's production-ready.",
      },
    ],
    ctaTitle: "Let's Build Something Great",
    ctaDescription:
      "Stop losing time to flaky builds and local environment friction. Let AI absorb the repetitive work so your team can stay focused on outcomes.",
    footerTagline:
      "Built with practical engineering discipline. Less noise. More production-ready software.",
  },
}

/**
 * LandingPage renders the marketing website and includes a top-level language-mode switch.
 * Step 3: Keep Yorkshire slang enabled by default and let users opt into English translation.
 */
export default function LandingPage() {
  const [isEnglishModeEnabled, setIsEnglishModeEnabled] = useState(false)

  /**
   * Step 4: Resolve active copy from toggle state using useMemo for clear intent.
   * Why: this keeps the render section clean and centralizes mode logic in one place.
   */
  const activeCopy = useMemo(
    () => LANDING_COPY[isEnglishModeEnabled ? "english" : "yorkshire"],
    [isEnglishModeEnabled],
  )

  /**
   * Step 4.1: Track the active index for the rotating brand words.
   * Why: this state lets React render the current word while GSAP handles transitions.
   */
  const [activeBrandIndex, setActiveBrandIndex] = useState(0)

  /**
   * Step 4.1.0: Mirror the current index in a mutable ref for GSAP callbacks.
   * Why: delayed animation callbacks need the latest index without triggering re-renders.
   */
  const activeBrandIndexRef = useRef(0)

  /**
   * Step 4.1.1: Count completed full rotations through the brand words.
   * Why: product wants a one-off 10-second pause on "e-yar" after the second full loop.
   */
  const completedBrandCyclesRef = useRef(0)

  /**
   * Step 4.1.2: Remember whether we already used the special 10-second hold.
   * Why: the long pause should happen only once, then the normal rotation resumes forever.
   */
  const didUseExtendedHoldRef = useRef(false)

  /**
   * Step 4.2: Keep a ref to the header brand element that GSAP animates.
   * Why: GSAP animates DOM nodes directly, so we provide a stable element reference.
   */
  const headerBrandRef = useRef<HTMLSpanElement | null>(null)

  /**
   * Step 4.3: Derive the currently displayed brand label from the active index.
   * Why: this keeps rendering logic declarative while the timeline changes the index.
   */
  const headerBrandName = ROTATING_BRAND_WORDS[activeBrandIndex]

  /**
   * Step 4.4: Build a GSAP-driven rotation loop with a one-time extended pause.
   * Why: we need custom timing logic (10s hold after second full rotation) that is easier
   * to express with recursive delayed calls than a fixed repeating timeline.
   */
  useEffect(() => {
    if (!headerBrandRef.current) {
      return
    }

    const context = gsap.context(() => {
      /**
       * Stage 0: Reset runtime refs when effect mounts (supports Strict Mode remounts).
       */
      activeBrandIndexRef.current = 0
      completedBrandCyclesRef.current = 0
      didUseExtendedHoldRef.current = false

      /**
       * Stage A: Keep the standard display duration for each word in seconds.
       */
      const defaultWordHoldSeconds = 2.3

      /**
       * Stage B: Define the one-off long pause once we've reached "e-yar" after
       * completing two full cycles.
       */
      const extendedEyArHoldSeconds = 10

      /**
       * Stage C: Animate out current word, swap text state, animate back in.
       * Why: this preserves the existing smooth visual motion while allowing dynamic delays.
       */
      const animateToNextWord = () => {
        const currentIndex = activeBrandIndexRef.current
        const nextIndex = (currentIndex + 1) % ROTATING_BRAND_WORDS.length

        gsap.to(headerBrandRef.current, {
          opacity: 0,
          y: -6,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            /**
             * Stage D: Update loop counters when we wrap back to index 0 ("e-yar").
             */
            if (nextIndex === 0) {
              completedBrandCyclesRef.current += 1
            }

            activeBrandIndexRef.current = nextIndex
            setActiveBrandIndex(nextIndex)

            gsap.fromTo(
              headerBrandRef.current,
              { opacity: 0, y: 6 },
              {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power2.out",
                onComplete: () => {
                  /**
                   * Stage E: Decide how long to keep the newly visible word onscreen.
                   * We apply the 10-second pause once, specifically on "e-yar" after
                   * the second full cycle has completed.
                   */
                  const shouldUseExtendedHold =
                    !didUseExtendedHoldRef.current &&
                    nextIndex === 0 &&
                    completedBrandCyclesRef.current >= 2

                  const holdDurationSeconds = shouldUseExtendedHold
                    ? extendedEyArHoldSeconds
                    : defaultWordHoldSeconds

                  if (shouldUseExtendedHold) {
                    didUseExtendedHoldRef.current = true
                  }

                  gsap.delayedCall(holdDurationSeconds, animateToNextWord)
                },
              },
            )
          },
        })
      }

      /**
       * Stage F: Start the first transition after the default initial hold.
       */
      gsap.delayedCall(defaultWordHoldSeconds, animateToNextWord)
    }, headerBrandRef)

    return () => {
      context.revert()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Code2 className="h-5 w-5 text-background" />
            </div>
            <span ref={headerBrandRef} className="text-xl font-semibold tracking-tight">
              {headerBrandName}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/*
              Step 5: Render an Apple-inspired pill switch in the header.
              Why: this creates a more polished, familiar toggle interaction than a plain checkbox.
            */}
            <div className="hidden md:block">
              <TranslationSwitch
                id="translate-to-english"
                checked={isEnglishModeEnabled}
                onCheckedChange={setIsEnglishModeEnabled}
              />
            </div>

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

      {/*
        Step 6: Preserve mobile access to the translation control.
        Why: users on small screens should be able to toggle language without horizontal crowding.
      */}
      <div className="border-b bg-background px-4 py-3 md:hidden">
        <TranslationSwitch
          id="translate-to-english-mobile"
          checked={isEnglishModeEnabled}
          onCheckedChange={setIsEnglishModeEnabled}
          compact
        />
      </div>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {activeCopy.badge}
            </div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
              {activeCopy.heroTitle}
              <br />
              <span className="text-muted-foreground">{activeCopy.heroSubtitle}</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
              {activeCopy.heroDescription}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  {activeCopy.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                See It Working
              </Button>
            </div>
          </div>
        </section>

        {/* Business Purpose Section - The Key Differentiator */}
        <section className="border-t bg-foreground py-24 text-background">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-1.5 text-sm text-background/80">
                <Target className="h-4 w-4" />
                The Missing Piece
              </div>
              <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {activeCopy.purposeTitle}
              </h2>
              <p className="text-xl text-background/70">{activeCopy.purposeSubtitle}</p>
            </div>

            <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-background/80">
              {activeCopy.purposeDescription}
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              <PurposeCard
                icon={<Compass className="h-6 w-6" />}
                title={activeCopy.purposePoints[0].title}
                description={activeCopy.purposePoints[0].description}
              />
              <PurposeCard
                icon={<Focus className="h-6 w-6" />}
                title={activeCopy.purposePoints[1].title}
                description={activeCopy.purposePoints[1].description}
              />
              <PurposeCard
                icon={<GitBranch className="h-6 w-6" />}
                title={activeCopy.purposePoints[2].title}
                description={activeCopy.purposePoints[2].description}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">{activeCopy.featureTitle}</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">{activeCopy.featureDescription}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<GitBranch className="h-6 w-6" />}
                title={activeCopy.features[0].title}
                description={activeCopy.features[0].description}
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title={activeCopy.features[1].title}
                description={activeCopy.features[1].description}
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title={activeCopy.features[2].title}
                description={activeCopy.features[2].description}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">{activeCopy.howItWorksDescription}</p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                number="01"
                title={activeCopy.steps[0].title}
                description={activeCopy.steps[0].description}
              />
              <StepCard
                number="02"
                title={activeCopy.steps[1].title}
                description={activeCopy.steps[1].description}
              />
              <StepCard
                number="03"
                title={activeCopy.steps[2].title}
                description={activeCopy.steps[2].description}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-foreground py-24 text-background">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">{activeCopy.ctaTitle}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-background/70">{activeCopy.ctaDescription}</p>
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
            <p className="text-sm text-muted-foreground">{activeCopy.footerTagline}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * TranslationSwitch renders an Apple-inspired toggle control with an animated thumb.
 * Step 7: Use a button-based switch for better styling control while keeping screen-reader semantics.
 */
function TranslationSwitch({
  id,
  checked,
  onCheckedChange,
  compact = false,
}: TranslationSwitchProps) {
  const wrapperClassName = compact
    ? "flex items-center justify-between text-sm text-muted-foreground"
    : "flex items-center gap-3 text-sm text-muted-foreground"

  return (
    <div className={wrapperClassName}>
      <span id={`${id}-label`} className="select-none">
        Translate to English
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
        <span className="sr-only">Translate to English</span>
      </button>
    </div>
  )
}

/**
 * PurposeCard displays a business purpose point in the dark inverted section.
 * Why: styled for dark background to create visual contrast and emphasize the key differentiator.
 */
function PurposeCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-background/20 bg-background/10 p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-background/70">{description}</p>
    </div>
  )
}

/**
 * FeatureCard displays one product capability with icon + copy.
 * Why: this keeps the features grid readable while allowing dynamic translated text.
 */
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

/**
 * StepCard displays a numbered onboarding step.
 * Why: preserving this component avoids duplicated markup in both language modes.
 */
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
