"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/landing/navigation"
import { HeroSection } from "@/components/landing/hero-section"
import { Footer } from "@/components/landing/footer"
import { safeJsonLdStringify } from '@/lib/sanitization'

// Lazy load below-the-fold components for better performance
const FeatureGrid = dynamic(() => import("@/components/landing/feature-grid").then(mod => ({ default: mod.FeatureGrid })), {
  loading: () => <div className="py-24 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>
})

const StatsSection = dynamic(() => import("@/components/landing/stats-section").then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="py-24 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>
})

const DemoSection = dynamic(() => import("@/components/landing/demo-section").then(mod => ({ default: mod.DemoSection })), {
  loading: () => <div className="py-24 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>
})

const BenefitsSection = dynamic(() => import("@/components/landing/benefits-section").then(mod => ({ default: mod.BenefitsSection })), {
  loading: () => <div className="py-24 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>
})

const FinalCTA = dynamic(() => import("@/components/landing/final-cta").then(mod => ({ default: mod.FinalCTA })), {
  loading: () => <div className="py-24 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>
})

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGetStarted = () => {
    router.push("/auth/signup")
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  // Landing page content for unauthenticated users
  const stats = [
    { value: 10000, label: "Users", suffix: "+" },
    { value: 50000, label: "Goals Completed", suffix: "+" },
    { value: 1000, label: "Active Lists", suffix: "+" },
  ]

  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Bucketly",
    "description": "Track your bucket list, compete with friends, and celebrate every milestone in the ultimate gamified goal-tracking experience",
    "url": "https://bucketly.app",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "10000"
    },
    "featureList": [
      "Create custom bucket lists",
      "Track progress with visualizations",
      "Earn points and compete on leaderboards",
      "Share achievements with friends",
      "Capture memories with photos",
      "Discover community lists"
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(structuredData) }}
      />

      <div className="min-h-screen bg-background">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50"
        >
          Skip to main content
        </a>

        <Navigation transparent={true} />

        <main id="main-content">
          {/* Hero Section - No animation needed as it's above the fold */}
          <HeroSection onGetStarted={handleGetStarted} onLogin={handleLogin} />

          {/* Features Section with scroll animation */}
          <section id="features" className="scroll-mt-20">
            <AnimatedSection>
              <FeatureGrid />
            </AnimatedSection>
          </section>

          {/* Stats Section with scroll animation */}
          <AnimatedSection>
            <StatsSection stats={stats} animated={true} />
          </AnimatedSection>

          {/* Demo Section with scroll animation */}
          <AnimatedSection>
            <DemoSection />
          </AnimatedSection>

          {/* Benefits Section with scroll animation */}
          <section id="about" className="scroll-mt-20">
            <AnimatedSection>
              <BenefitsSection />
            </AnimatedSection>
          </section>

          {/* Final CTA Section with scroll animation */}
          <AnimatedSection>
            <FinalCTA onSignUp={handleGetStarted} />
          </AnimatedSection>
        </main>
      </div>
      <Footer />
    </>
  )
}

// Animated section wrapper component for scroll animations
// Optimized with single observer instance and cleanup
function AnimatedSection({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Cleanup immediately after triggering
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
        }`}
    >
      {children}
    </div>
  )
}
