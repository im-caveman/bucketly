"use client"

import Image from "next/image"
import { useState } from "react"

interface Demo {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imagePosition: "left" | "right"
}

interface DemoSectionProps {
  demos?: Demo[]
}

const defaultDemos: Demo[] = [
  {
    title: "Your Personal Dashboard",
    description:
      "Get a complete overview of all your bucket lists in one place. Track progress with beautiful visualizations, see your recent achievements, and stay motivated with your stats and leaderboard position.",
    imageSrc: "/placeholder.svg",
    imageAlt: "Bucketly dashboard showing multiple bucket lists with progress bars and statistics",
    imagePosition: "right",
  },
  {
    title: "Detailed List Management",
    description:
      "Organize your goals with custom bucket lists. Add items, mark them complete, and watch your progress grow. Each list shows completion percentage and total points earned.",
    imageSrc: "/placeholder.svg",
    imageAlt: "Bucket list detail view showing individual items with checkboxes and completion status",
    imagePosition: "left",
  },
  {
    title: "Compete on the Leaderboard",
    description:
      "See how you rank against other users. Earn points by completing goals and climb the global leaderboard. View top performers and get inspired by their achievements.",
    imageSrc: "/placeholder.svg",
    imageAlt: "Leaderboard showing top users with their points and rankings",
    imagePosition: "right",
  },
  {
    title: "Perfect for Mobile",
    description:
      "Take your bucket list anywhere. Our mobile-optimized design ensures you can track and complete goals on the go, with the same beautiful experience across all devices.",
    imageSrc: "/placeholder.svg",
    imageAlt: "Mobile view of Bucketly app showing responsive design",
    imagePosition: "left",
  },
]

export function DemoSection({ demos = defaultDemos }: DemoSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-background to-primary/5" aria-labelledby="demo-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          {/* Font sizes: 28px (mobile) to 48px (desktop) */}
          <h2 id="demo-heading" className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-bold px-4">
            See{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bucketly
            </span>{" "}
            in Action
          </h2>
          {/* Font sizes: 16px (mobile) to 18px (desktop) */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            Experience the intuitive interface designed to make goal tracking effortless and enjoyable
          </p>
        </div>

        {/* Demo Items - Responsive spacing */}
        <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24" role="list">
          {demos.map((demo, index) => (
            <div key={index} role="listitem">
              <DemoItem demo={demo} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface DemoItemProps {
  demo: Demo
  index: number
}

function DemoItem({ demo, index }: DemoItemProps) {
  const [imageError, setImageError] = useState(false)
  const isLeft = demo.imagePosition === "left"
  const isMobileFrame = index === 3 // Last demo is mobile view

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center ${
        isLeft ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Content Column */}
      <div
        className={`space-y-3 sm:space-y-4 ${
          isLeft ? "lg:order-2" : "lg:order-1"
        } text-center lg:text-left px-2`}
      >
        {/* Font sizes: 24px (mobile) to 36px (desktop) */}
        <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {demo.title}
        </h3>
        {/* Font sizes: 16px (mobile) to 18px (desktop) */}
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {demo.description}
        </p>
      </div>

      {/* Image Column with Device Frame */}
      <div
        className={`${
          isLeft ? "lg:order-1" : "lg:order-2"
        } flex justify-center`}
        role="img"
        aria-label={demo.imageAlt}
      >
        {isMobileFrame ? (
          <MobileFrame
            imageSrc={demo.imageSrc}
            imageAlt={demo.imageAlt}
            imageError={imageError}
            onImageError={() => setImageError(true)}
          />
        ) : (
          <BrowserFrame
            imageSrc={demo.imageSrc}
            imageAlt={demo.imageAlt}
            imageError={imageError}
            onImageError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  )
}

interface FrameProps {
  imageSrc: string
  imageAlt: string
  imageError: boolean
  onImageError: () => void
}

function BrowserFrame({
  imageSrc,
  imageAlt,
  imageError,
  onImageError,
}: FrameProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* Browser Chrome - Responsive sizing */}
      <div className="bg-card border border-border rounded-t-lg sm:rounded-t-xl p-2 sm:p-3 flex items-center gap-2" role="presentation">
        <div className="flex gap-1.5 sm:gap-2" aria-label="Browser window controls">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" aria-label="Close" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" aria-label="Minimize" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" aria-label="Maximize" />
        </div>
        <div className="flex-1 mx-2 sm:mx-4 h-5 sm:h-6 bg-background rounded flex items-center px-2 sm:px-3" role="presentation">
          <span className="text-xs text-muted-foreground truncate" aria-label="URL bar">bucketly.app</span>
        </div>
      </div>

      {/* Browser Content - Optimized image loading */}
      <div className="relative w-full aspect-video bg-background border-x border-b border-border rounded-b-lg sm:rounded-b-xl overflow-hidden shadow-2xl shadow-primary/20">
        {!imageError ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-top"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 700px"
            onError={onImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center" role="img" aria-label="Demo preview placeholder">
            <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
              <div className="text-5xl sm:text-6xl" role="img" aria-label="Desktop computer emoji">🖥️</div>
              <p className="text-muted-foreground font-display text-base sm:text-lg">
                Demo Preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MobileFrame({
  imageSrc,
  imageAlt,
  imageError,
  onImageError,
}: FrameProps) {
  return (
    <div className="w-full max-w-[280px] sm:max-w-sm mx-auto">
      {/* Mobile Device Frame - Responsive border width */}
      <div className="relative bg-card border-[6px] sm:border-8 border-card rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-primary/20 overflow-hidden" role="presentation">
        {/* Notch - Responsive sizing */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-card rounded-b-xl sm:rounded-b-2xl z-10" role="presentation" aria-label="Phone notch" />

        {/* Screen Content - Optimized image loading */}
        <div className="relative w-full aspect-[9/19.5] bg-background overflow-hidden">
          {!imageError ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-top"
              loading="lazy"
              sizes="(max-width: 640px) 280px, 384px"
              onError={onImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center" role="img" aria-label="Mobile preview placeholder">
              <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
                <div className="text-5xl sm:text-6xl" role="img" aria-label="Mobile phone emoji">📱</div>
                <p className="text-muted-foreground font-display text-base sm:text-lg">
                  Mobile Preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator - Responsive sizing */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-muted-foreground/30 rounded-full" role="presentation" aria-label="Home indicator" />
      </div>
    </div>
  )
}
