"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { subscribeToNewsletter, checkSubscriptionStatus, type NewsletterSource } from "@/lib/newsletter-service"
import PlusIcon from "../icons/plus"
import MinusIcon from "../icons/minus"
import EmailIcon from "../icons/email"
import { cn } from "@/lib/utils"

const CONTENT_HEIGHT = 420 // Height of expandable content

type NewsletterState = "collapsed" | "expanded" | "success"

export default function Newsletter() {
  const [state, setState] = useState<NewsletterState>("collapsed")
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const isExpanded = state !== "collapsed"

  // Check subscription status on mount if user is logged in
  useEffect(() => {
    if (user?.email) {
      setIsChecking(true)
      checkSubscriptionStatus(user.email)
        .then((subscribed) => {
          setIsSubscribed(subscribed)
          if (subscribed) {
            setEmail(user.email || "")
          }
        })
        .catch(() => {
          // Silently fail - user might not be subscribed
        })
        .finally(() => {
          setIsChecking(false)
        })
    }
  }, [user?.email])

  const toggleExpanded = () => {
    setState((prev) => (prev === "collapsed" ? "expanded" : "collapsed"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const source: NewsletterSource = user ? "sidebar" : "sidebar"
      const subscription = await subscribeToNewsletter(email.trim(), user?.id || null, source, {
        user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        timestamp: new Date().toISOString(),
      })

      setIsSubscribed(true)
      setState("success")

      // Show success message
      toast({
        title: "Success! 🎉",
        description: user 
          ? "You've been subscribed to our newsletter. Check your notifications for a welcome message!"
          : "You've been subscribed to our newsletter. We&apos;ll keep you updated!",
      })

      // Reset to expanded state after 3 seconds
      setTimeout(() => {
        setState("expanded")
      }, 3000)
    } catch (error: any) {
      console.error('Newsletter subscription error:', error)
      
      // Handle specific error cases
      let errorMessage = "Something went wrong. Please try again."
      
      if (error?.message) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          errorMessage = "You're already subscribed to our newsletter!"
          // If already subscribed, treat as success
          setIsSubscribed(true)
          setState("success")
          toast({
            title: "Already subscribed",
            description: "You&apos;re already on our newsletter list!",
          })
          setTimeout(() => {
            setState("expanded")
          }, 3000)
          return
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address"
        } else if (error.message.includes('permission') || error.message.includes('not allowed')) {
          errorMessage = "Unable to subscribe at this time. Please try again later."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Subscription failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="absolute bottom-0 inset-x-0 z-50"
      initial={{ y: CONTENT_HEIGHT }}
      animate={{ y: isExpanded ? 0 : CONTENT_HEIGHT }}
      transition={{ duration: 0.3, ease: "circInOut" }}
    >
      {/* Header */}
      <motion.div
        layout
        className={cn(
          "cursor-pointer flex items-center gap-3 transition-all duration-300 w-full h-14 bg-background text-foreground rounded-t-lg px-4 py-3",
          state === "success" && "bg-primary text-primary-foreground"
        )}
        onClick={toggleExpanded}
      >
        <motion.div layout className="flex items-center gap-2 flex-1">
          <motion.div
            animate={{
              scale: state === "success" ? [1, 1.2, 1] : 1,
              rotate: state === "success" ? [0, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <EmailIcon className="size-5" />
          </motion.div>
          <span className="text-sm font-medium uppercase">
            {state === "success" ? "Subscribed!" : isSubscribed ? "Newsletter" : "Newsletter"}
          </span>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          >
            {state === "collapsed" ? <PlusIcon className="size-4" /> : <MinusIcon className="size-4" />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Expandable Content */}
      <div className="pt-1 overflow-y-auto" style={{ height: CONTENT_HEIGHT }}>
        <div className="bg-background text-foreground h-full">
          <AnimatePresence mode="wait">
            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <EmailIcon className="size-8 text-primary" />
                  </div>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-display font-bold mb-2"
                >
                  Welcome to the Community! 🎉
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground max-w-sm"
                >
                    You&apos;ll receive updates about new features, tips, and inspiring stories from our community.
                </motion.p>
              </motion.div>
            )}

            {state === "expanded" && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col p-6"
              >
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <EmailIcon className="size-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">Stay in the Loop</h3>
                    <p className="text-sm text-muted-foreground">
                      Get weekly updates on new features, success stories, and tips to achieve your bucket list goals.
                    </p>
                  </motion.div>

                  {/* Subscription Form */}
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || isSubscribed}
                        className="h-12 text-base"
                        required
                      />
                      {isSubscribed && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-muted-foreground text-center"
                        >
                          ✓ You&apos;re already subscribed
                        </motion.p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || isSubscribed || isChecking}
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            ⏳
                          </motion.span>
                          Subscribing...
                        </span>
                      ) : isSubscribed ? (
                        "✓ Subscribed"
                      ) : (
                        "Subscribe to Newsletter"
                      )}
                    </Button>
                  </motion.form>

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-border"
                  >
                    <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider">
                      Follow Us
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      {/* Social media links can be added here */}
                      <a
                        href="https://twitter.com/bucketly"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Twitter"
                      >
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                      <a
                        href="https://github.com/bucketly"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="GitHub"
                      >
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

