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
    title: "Create Custom Lists",
    description: "Build personalized bucket lists for travel, food, books, and more with unlimited customization options"
  },
  {
    icon: "📊",
    title: "Track Progress",
    description: "Visualize your journey with beautiful progress bars and detailed statistics that keep you motivated"
  },
  {
    icon: "🏆",
    title: "Earn Points & Compete",
    description: "Complete goals to earn points and climb the global leaderboard while unlocking achievements"
  },
  {
    icon: "🤝",
    title: "Share & Connect",
    description: "Follow friends, share achievements, and inspire each other on your bucket list journeys"
  },
  {
    icon: "📸",
    title: "Capture Memories",
    description: "Document your experiences with photos and stories to relive your favorite moments forever"
  },
  {
    icon: "🔍",
    title: "Discover Lists",
    description: "Explore curated bucket lists from the community and find inspiration for your next adventure"
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
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Achieve More
            </span>
          </h2>
          {/* Font sizes: 16px (mobile) to 18px (desktop) */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            Powerful features designed to help you track, complete, and celebrate your bucket list goals
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
