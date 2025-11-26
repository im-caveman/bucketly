"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface NavigationProps {
  transparent?: boolean
}

export function Navigation({ transparent = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !transparent
        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
        : "bg-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Responsive sizing */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px] focus:outline-none rounded-md"
            aria-label="Bucketly home"
          >
            <Image
              src="/logo.svg"
              alt="Bucketly logo"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10"
            />
            {/* Font sizes: 18px (mobile) to 24px (desktop) */}
            <span className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              Bucketly
            </span>
          </Link>

          {/* Desktop Navigation - Font size: 14px */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href.substring(1))}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-2 focus:outline-none rounded-md cursor-pointer"
                aria-label={`Navigate to ${link.label} section`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Button asChild variant="ghost" size="sm" className="h-9 px-4 focus:outline-none">
              <Link href="/auth/login" aria-label="Log in to your account">Log In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity focus:outline-none"
            >
              <Link href="/auth/signup" aria-label="Sign up for a new account">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - 44x44px touch target */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Optimized touch targets */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="py-4 space-y-2" aria-label="Mobile navigation">
              {/* Font size: 16px, minimum 44px height */}
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href.substring(1))}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md min-h-[44px] focus:outline-none cursor-pointer"
                  aria-label={`Navigate to ${link.label} section`}
                >
                  {link.label}
                </button>
              ))}
              <div className="px-4 pt-4 space-y-3 border-t border-border">
                <Button asChild variant="outline" size="lg" className="w-full min-h-[44px] text-base focus:outline-none">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full min-h-[44px] text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity focus:outline-none"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </nav>
    </header>
  )
}
