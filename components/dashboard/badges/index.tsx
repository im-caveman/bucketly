"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { Progress } from "@/components/ui/progress"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useBadges, useUserBadges } from "@/hooks/use-badges"
import { Loader2, Lock } from "lucide-react"
import type { Badge as BadgeType } from "@/lib/bucket-list-service"

export default function BadgePreview() {
    const { user } = useAuth()
    const { badges, isLoading: badgesLoading } = useBadges()
    const { userBadges, isLoading: userBadgesLoading } = useUserBadges(user?.id)

    const isLoading = badgesLoading || userBadgesLoading

    // Create a map of badge IDs that the user has earned
    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

    // Separate earned and locked badges
    const earnedBadges = badges?.filter((badge) => earnedBadgeIds.has(badge.id)) || []
    const lockedBadges = badges?.filter((badge) => !earnedBadgeIds.has(badge.id)) || []

    // Get user badge info for earned badges (to show awarded date)
    const getUserBadgeInfo = (badgeId: string) => {
        return userBadges?.find((ub) => ub.badge_id === badgeId)
    }

    // Calculate progress for a specific badge based on criteria
    const calculateBadgeProgress = (badge: BadgeType) => {
        if (!user || !badge.criteria) return { current: 0, target: 0, percentage: 0 }

        const criteria = badge.criteria as any
        const userProfile = user as any // Type assertion to access profile fields

        // Example criteria structure: { type: "items_completed", target: 100 }
        if (criteria.type === "items_completed") {
            const current = userProfile.items_completed || 0
            const target = criteria.target || 0
            const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
            return { current, target, percentage }
        }

        if (criteria.type === "lists_created") {
            const current = userProfile.lists_created || 0
            const target = criteria.target || 0
            const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
            return { current, target, percentage }
        }

        if (criteria.type === "total_points") {
            const current = userProfile.total_points || 0
            const target = criteria.target || 0
            const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
            return { current, target, percentage }
        }

        return { current: 0, target: 0, percentage: 0 }
    }

    // Calculate overall stats
    const totalBadges = badges?.length || 0
    const earnedCount = earnedBadges.length

    return (
        <Card className="h-full">
            <CardHeader className="flex items-center justify-between pl-3 pr-3">
                <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                    {earnedCount > 0 ? <Badge>{earnedCount}</Badge> : <Bullet />}
                    Badges
                </CardTitle>
                <div className="text-xs font-semibold text-muted-foreground">
                    {earnedCount}/{totalBadges}
                </div>
            </CardHeader>

            <CardContent className="bg-accent p-1.5 overflow-hidden">
                <div className="space-y-2">
                    {/* Badge List - no scrollbar */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        <AnimatePresence initial={false} mode="popLayout">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    <p className="text-sm text-foreground/60 mt-2">Loading badges...</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Earned Badges */}
                                    {earnedBadges.map((badge) => {
                                        const userBadge = getUserBadgeInfo(badge.id)
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                key={badge.id}
                                            >
                                                <div className="bg-background rounded-lg p-3 flex items-center gap-3 border-2 border-primary/20 mb-2">
                                                    <div className="relative size-12 flex-shrink-0">
                                                        <img
                                                            src={badge.icon_url}
                                                            alt={badge.name}
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{badge.name}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {badge.description}
                                                        </p>
                                                        {userBadge && (
                                                            <p className="text-xs text-primary mt-1">
                                                                Earned {new Date(userBadge.awarded_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}

                                    {/* Locked Badges with Individual Progress */}
                                    {lockedBadges.map((badge) => {
                                        const progress = calculateBadgeProgress(badge)
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                key={badge.id}
                                            >
                                                <div className="bg-background rounded-lg p-3 space-y-2 mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative size-12 flex-shrink-0">
                                                            <img
                                                                src={badge.icon_url}
                                                                alt={badge.name}
                                                                className="object-contain w-full h-full grayscale opacity-50"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded">
                                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm truncate opacity-70">{badge.name}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {badge.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Individual Progress Bar */}
                                                    {progress.target > 0 && (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-muted-foreground">Progress</span>
                                                                <span className="font-semibold">
                                                                    {progress.current}/{progress.target}
                                                                </span>
                                                            </div>
                                                            <Progress value={progress.percentage} className="h-1.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}

                                    {!isLoading && totalBadges === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-foreground/80 font-medium">
                                                No badges available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
