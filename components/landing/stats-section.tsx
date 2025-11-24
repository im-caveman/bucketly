"use client"

import { useEffect, useRef, useState } from "react"

interface Stat {
  value: number
  label: string
  suffix?: string
}

interface StatsSectionProps {
  stats: Stat[]
  animated?: boolean
}

export function StatsSection({ stats, animated = true }: StatsSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8" aria-labelledby="stats-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 space-y-3 sm:space-y-4">
          {/* Font sizes: 28px (mobile) to 48px (desktop) */}
          <h2 id="stats-heading" className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-bold px-4">
            Join a Growing{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Community
            </span>
          </h2>
          {/* Font sizes: 16px (mobile) to 18px (desktop) */}
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
            Thousands of users are already turning their dreams into reality
          </p>
        </div>

        {/* Stats Card - Responsive padding and spacing */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Responsive grid: stacked on mobile, 3 columns on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                animated={animated}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  stat: Stat
  animated: boolean
  delay: number
}

function StatCard({ stat, animated, delay }: StatCardProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer to trigger animation when scrolled into view
  useEffect(() => {
    if (!animated || hasAnimated) return

    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          setHasAnimated(true)
          observer.disconnect() // Cleanup immediately
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [animated, hasAnimated])

  // Counter animation using requestAnimationFrame
  useEffect(() => {
    if (!isVisible || !animated) {
      setCount(stat.value)
      return
    }

    const duration = 2000 // 2 seconds
    const startTime = performance.now() + delay
    let animationFrame: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate)
        return
      }

      if (elapsed < duration) {
        const progress = elapsed / duration
        // Ease-out cubic for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(stat.value * easeOut))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(stat.value)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, stat.value, animated, delay])

  return (
    <div ref={cardRef} className="text-center py-2" role="group" aria-label={`${stat.label} statistic`}>
      {/* Large number with pulse animation - Font sizes: 40px (mobile) to 72px (desktop) */}
      <div
        className={`font-display text-[2.5rem] leading-none sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-3 ${
          isVisible && animated ? "animate-[marquee-pulse_3s_ease-in-out_infinite]" : ""
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {count.toLocaleString()}
        {stat.suffix || ""}
      </div>
      {/* Label - Font sizes: 14px (mobile) to 18px (desktop) */}
      <div className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
        {stat.label}
      </div>
    </div>
  )
}
