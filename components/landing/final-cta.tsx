import Link from 'next/link'

interface FinalCTAProps {
  onSignUp?: () => void
}

export function FinalCTA({ onSignUp }: FinalCTAProps) {
  const handleSignUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onSignUp) {
      e.preventDefault()
      onSignUp()
    }
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-primary to-accent" aria-labelledby="final-cta-heading">
      <div className="max-w-7xl mx-auto text-center">
        {/* Font sizes: 32px (mobile) to 60px (desktop) */}
        <h2 id="final-cta-heading" className="font-display text-[2rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white px-4">
          Ready to Start Your Journey?
        </h2>
        {/* Font sizes: 16px (mobile) to 20px (desktop) */}
        <p className="font-mono text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
          Join thousands of users turning dreams into reality
        </p>
        {/* Minimum 44x44px touch target with responsive sizing */}
        <Link
          href="/auth/signup"
          onClick={handleSignUp}
          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-background hover:bg-background/90 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary min-h-[44px] w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          aria-label="Sign up to create a free Bucketly account"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  )
}

export type { FinalCTAProps }
