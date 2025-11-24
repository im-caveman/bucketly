"use client"

import { Card, CardContent } from "@/components/ui/card"

interface Benefit {
  icon: string
  title: string
  description: string
}

interface BenefitsSectionProps {
  benefits?: Benefit[]
}

const defaultBenefits: Benefit[] = [
  {
    icon: "🎮",
    title: "Gamification That Motivates",
    description: "Points, ranks, and achievements turn goal-setting into an engaging game that keeps you coming back for more"
  },
  {
    icon: "👥",
    title: "Social Accountability",
    description: "Share progress with friends and stay motivated through community support and friendly competition"
  },
  {
    icon: "📈",
    title: "Beautiful Progress Tracking",
    description: "Visualize your journey with intuitive charts and satisfying completion animations that celebrate every win"
  }
]

export function BenefitsSection({ benefits = defaultBenefits }: BenefitsSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-background via-primary/5 to-background" aria-labelledby="benefits-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          {/* Font sizes: 28px (mobile) to 48px (desktop) */}
          <h2 id="benefits-heading" className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-bold px-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bucketly
            </span>
          </h2>
          {/* Font sizes: 16px (mobile) to 18px (desktop) */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            More than just a to-do list - experience the difference that makes achieving your dreams inevitable
          </p>
        </div>

        {/* Benefits Grid - Responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8" role="list">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 border-border/50 min-h-[240px]"
              role="listitem"
            >
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" role="presentation" />
              
              <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-6 h-full flex flex-col">
                {/* Icon - Responsive sizing */}
                <div className="text-5xl sm:text-6xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label={`${benefit.title} icon`}>
                  {benefit.icon}
                </div>

                {/* Title - Font sizes: 20px (mobile) to 24px (desktop) */}
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  {benefit.title}
                </h3>

                {/* Description - Font size: 16px */}
                <p className="text-base text-muted-foreground leading-relaxed flex-grow">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
