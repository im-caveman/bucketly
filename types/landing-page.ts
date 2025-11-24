// Core data models for landing page components
export interface Feature {
  icon: string
  title: string
  description: string
}

export interface Stat {
  value: number
  label: string
  suffix?: string
}

export interface Demo {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imagePosition: 'left' | 'right'
}

export interface Benefit {
  icon: string
  title: string
  description: string
}

// Landing page configuration
export interface LandingPageConfig {
  hero: {
    headline: string
    subheadline: string
    primaryCTA: string
    secondaryCTA: string
    heroImageSrc?: string
  }
  features: Feature[]
  stats: Stat[]
  demos: Demo[]
  benefits: Benefit[]
  finalCTA: {
    headline: string
    subtext: string
    ctaText: string
  }
}

// Animation configuration
export interface AnimationConfig {
  enableScrollAnimations: boolean
  enableCounterAnimations: boolean
  enableParallax: boolean
  animationDuration: number // milliseconds
}
