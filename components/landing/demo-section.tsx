"use client"

import Image from "next/image"
import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    imageSrc: "/images/landing/hero-dashboard.png",
    imageAlt: "Bucketly dashboard showing multiple bucket lists with progress bars and statistics",
    imagePosition: "right",
  },
  {
    title: "Detailed List Management",
    description:
      "Organize your goals with custom bucket lists. Add items, mark them complete, and watch your progress grow. Each list shows completion percentage and total points earned.",
    imageSrc: "/images/landing/feature-create-lists.png",
    imageAlt: "Bucket list detail view showing individual items with checkboxes and completion status",
    imagePosition: "left",
  },
  {
    title: "Compete on the Leaderboard",
    description:
      "See how you rank against other users. Earn points by completing goals and climb the global leaderboard. View top performers and get inspired by their achievements.",
    imageSrc: "/images/landing/feature-earn-points.png",
    imageAlt: "Leaderboard showing top users with their points and rankings",
    imagePosition: "right",
  },
  {
    title: "Perfect for Mobile",
    description:
      "Take your bucket list anywhere. Our mobile-optimized design ensures you can track and complete goals on the go, with the same beautiful experience across all devices.",
    imageSrc: "/images/landing/feature-capture-memories.png",
    imageAlt: "Mobile view of Bucketly app showing responsive design",
    imagePosition: "left",
  },
]

export function DemoSection({ demos = defaultDemos }: DemoSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("reInit", onInit)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onInit, onSelect])

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-background to-primary/5" aria-labelledby="demo-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 id="demo-heading" className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-bold px-4">
            See{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bucketly
            </span>{" "}
            in Action
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            Experience the intuitive interface designed to make goal tracking effortless and enjoyable
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {demos.map((demo, index) => (
                <div className="flex-[0_0_100%] min-w-0 pl-4" key={index}>
                  <DemoItem demo={demo} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden lg:flex h-12 w-12 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary z-10"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden lg:flex h-12 w-12 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary z-10"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === selectedIndex ? "w-8 bg-primary" : "w-2.5 bg-primary/20 hover:bg-primary/40"
                }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
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
  const isMobileFrame = index === 3 // Last demo is mobile view

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto px-4">
      {/* Content Column */}
      <div className="space-y-4 text-center lg:text-left lg:order-1">
        <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {demo.title}
        </h3>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {demo.description}
        </p>
      </div>

      {/* Image Column */}
      <div className="flex justify-center lg:order-2" role="img" aria-label={demo.imageAlt}>
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
      {/* Browser Chrome */}
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

      {/* Browser Content */}
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
      {/* Mobile Device Frame */}
      <div className="relative bg-card border-[6px] sm:border-8 border-card rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-primary/20 overflow-hidden" role="presentation">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-card rounded-b-xl sm:rounded-b-2xl z-10" role="presentation" aria-label="Phone notch" />

        {/* Screen Content */}
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

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-muted-foreground/30 rounded-full" role="presentation" aria-label="Home indicator" />
      </div>
    </div>
  )
}
