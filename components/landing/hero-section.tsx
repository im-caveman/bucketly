"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface HeroSectionProps {
  onGetStarted: () => void
  onLogin: () => void
}

export function HeroSection({ onGetStarted, onLogin }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16 md:pt-20" aria-label="Hero section">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 w-full text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Badge/Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mx-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">The Ultimate Bucket List App</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight" id="hero-heading">
            Life&apos;s Too Short for<br />
            <span className="relative inline-block whitespace-nowrap">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                Incomplete Bucket Lists
              </span>
              {/* Decorative underline/sparkle */}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands tracking epic adventures, earning points, and making memories that matter—one goal at a time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              asChild
              size="lg"
              className="px-8 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity focus:outline-none"
              onClick={onGetStarted}
            >
              <Link href="/auth/signup" aria-label="Sign up to start your journey with Bucketly">
                Start Checking Things Off
              </Link>
            </Button>
          </div>

          {/* Social Proof / Trust Indicators (Optional) */}
          <div className="pt-12 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Add logos or trust text here if needed */}
            <p className="text-sm text-muted-foreground">Join 10,000+ Dreamers Worldwide</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
