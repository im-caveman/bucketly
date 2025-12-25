"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Share2, Download, X, Trophy, CheckCircle2 } from "lucide-react"
import type { Badge } from "@/lib/bucket-list-service"
import { useAuth } from "@/contexts/auth-context"

interface BadgeCelebrationProps {
    badge: Badge | null
    onClose: () => void
}

export function BadgeCelebration({ badge, onClose }: BadgeCelebrationProps) {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (badge) {
            setIsOpen(true)
            // Trigger confetti
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
            }, 250)

            return () => clearInterval(interval)
        } else {
            setIsOpen(false)
        }
    }, [badge])

    const handleShare = async () => {
        if (!badge || !user) return

        const username = user.user_metadata?.username || user.email?.split('@')[0] || "User"
        const shareData = {
            title: `I've unlocked the ${badge.name} badge!`,
            text: `Hey! I just unlocked the "${badge.name}" achievement on Bucketly! Checkout my bucket list and join me. #Bucketly #${badge.name.replace(/\s+/g, '')} @${username}`,
            url: window.location.origin + `/profile/${username}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
                alert("Share link copied to clipboard!")
            }
        } catch (err) {
            console.error("Error sharing:", err)
        }
    }

    if (!badge) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] bg-gradient-to-b from-primary/10 to-background border-primary/20 p-0 overflow-hidden">
                <div className="relative p-6 text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="mx-auto w-32 h-32 relative"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                        <img
                            src={badge.icon_url}
                            alt={badge.name}
                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Trophy className="h-6 w-6 text-primary" />
                            Achievement Unlocked!
                        </DialogTitle>
                        <DialogDescription className="text-lg font-semibold text-foreground">
                            You earned the <span className="text-primary">{badge.name}</span> badge
                        </DialogDescription>
                        <p className="text-sm text-muted-foreground italic">
                            "{badge.description}"
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-2 pt-4"
                    >
                        <Button
                            onClick={handleShare}
                            className="w-full h-12 text-lg font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                            <Share2 className="h-5 w-5" />
                            Share Achievement
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full"
                        >
                            Maybe Later
                        </Button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
