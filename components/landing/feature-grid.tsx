"use client"

import { Card, CardContent } from "@/components/ui/card"

interface Feature {
  icon: string
  title: string
  description: string
}

interface FeatureGridProps {
  features?: Feature[]
}

const defaultFeatures: Feature[] = [
  {
    icon: "📝",
    title: "Your Life, Your Lists, Your Way",
    description: "Design bucket lists tailored to YOU. Choose from curated items or add your own—unlimited lists, unlimited possibilities."
  },
  {
    icon: "📊",
    title: "See How Far You've Come",
    description: "Track every step with visual progress that celebrates your wins and keeps motivation high when you need it most."
  },
  {
    icon: "🏆",
    title: "Because Bragging Rights Should Be Earned",
    description: "Earn points for every bucket list item you crush. Compete globally, dominate your category, and let friendly competition fuel your fire."
  },
  {
    icon: "🤝",
    title: "Stop Doing It Alone",
    description: "Follow friends, join the movement, and turn solo goals into shared celebrations. Your bucket list journey just got a whole lot less lonely."
  },
  {
    icon: "📸",
    title: "Because You'll Want to Remember This",
    description: "Document every adventure with photos, videos, and journal entries. Build a digital scrapbook of your most incredible experiences."
  },
  {
    icon: "🔍",
    title: "Never Run Out of Things to Do",
    description: "Explore expert-curated bucket lists and community favorites. Travel? Food? Books? Your next obsession is waiting."
  }
]

export function FeatureGrid({ features = defaultFeatures }: FeatureGridProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-background" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          {/* Font sizes: 28px (mobile) to 48px (desktop) */}
          <h2 id="features-heading" className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-bold px-4">
            Features That Make Goals{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Inevitable
            </span>
          </h2>
          {/* Font sizes: 16px (mobile) to 18px (desktop) */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            The complete toolkit to track, achieve, and celebrate your biggest dreams
          </p>
        </div>

        {/* Feature Grid - Optimized for all breakpoints */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8" role="list">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 min-h-[200px]"
              role="listitem"
            >
              <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4 h-full flex flex-col">
                {/* Icon - Responsive sizing */}
                <div className="text-4xl sm:text-5xl" role="img" aria-label={`${feature.title} icon`}>{feature.icon}</div>

                {/* Title - Font sizes: 18px (mobile) to 20px (desktop) */}
                < h3 className="font-display text-lg sm:text-xl font-semibold text-foreground" >
                  {feature.title}
                </h3>

                {/* Description - Font size: 14px */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))
          }
        </div >
      </div >
    </section >
  )
}
