"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  onGetStarted: () => void
  onLogin: () => void
}

export function HeroSection({ onGetStarted, onLogin }: HeroSectionProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 pt-16 md:pt-20" aria-label="Hero section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Headline - Font sizes: 32px (mobile) to 72px (desktop) */}
            <h1 className="font-display text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold" id="hero-heading">
              Turn Dreams Into{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Achievements
              </span>
            </h1>

            {/* Subheadline - Font sizes: 16px (mobile) to 20px (desktop) */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Track your bucket list, compete with friends, and celebrate every
              milestone in the ultimate gamified goal-tracking experience
            </p>

            {/* CTA Buttons - Minimum 44x44px touch targets */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4">
              <Button
                asChild
                size="xl"
                className="min-h-[44px] w-full sm:w-auto px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-base focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={onGetStarted}
              >
                <Link href="/auth/signup" aria-label="Sign up to start your journey with Bucketly">Start Your Journey</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="min-h-[44px] w-full sm:w-auto px-8 text-base focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={onLogin}
              >
                <Link href="/auth/login" aria-label="Log in to your Bucketly account">Log In</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Visual - Optimized aspect ratios for all breakpoints */}
          <div className="relative w-full aspect-square max-h-[400px] sm:max-h-[500px] lg:max-h-none lg:aspect-auto lg:h-[450px] xl:h-[500px] flex items-center justify-center mt-4 lg:mt-0" role="img" aria-label="Bucketly application preview">
            {!imageError ? (
              <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/20">
                <Image
                  src="/placeholder.svg"
                  alt="Dashboard preview showing multiple bucket lists with colorful progress bars, completion statistics, and gamification elements including points and achievements"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              // Fallback gradient when image fails to load
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 border border-border/50 shadow-2xl shadow-primary/20 flex items-center justify-center">
                <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
                  <div className="text-5xl sm:text-6xl" role="img" aria-label="Target emoji">🎯</div>
                  <p className="text-muted-foreground font-display text-lg sm:text-xl">
                    Your Journey Starts Here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
