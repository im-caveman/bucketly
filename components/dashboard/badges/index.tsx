"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { Progress } from "@/components/ui/progress"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useUserBadges } from "@/hooks/use-badges"
import { useBadgeProgress } from "@/hooks/use-badge-progress"
import { Loader2, Lock } from "lucide-react"
import { BadgeCelebration } from "./celebration"

export default function BadgePreview() {
    const { user } = useAuth()
    const {
        progressMap,
        earnedBadges,
        lockedBadges,
        isLoading,
        badges,
        celebrationQueue,
        dismissCelebration
    } = useBadgeProgress(user?.id)

    const [selectedBadge, setSelectedBadge] = React.useState<any>(null)

    const { userBadges } = useUserBadges(user?.id)

    // Current badge being celebrated
    const currentCelebration = celebrationQueue.length > 0 ? celebrationQueue[0] : null

    // Get user badge info for earned badges (to show awarded date)
    const getUserBadgeInfo = (badgeId: string) => {
        return userBadges?.find((ub) => ub.badge_id === badgeId)
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
                                                onClick={() => setSelectedBadge(badge)}
                                                className="cursor-pointer group"
                                            >
                                                <div className="bg-background rounded-lg p-3 flex items-center gap-3 border-2 border-primary/20 mb-2 hover:border-primary/40 transition-colors">
                                                    <div className="relative size-12 flex-shrink-0">
                                                        <img
                                                            src={badge.icon_url}
                                                            alt={badge.name}
                                                            className="object-contain w-full h-full scale-110 group-hover:scale-125 transition-transform"
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
                                        const progress = progressMap[badge.id]
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
                                                                className="object-contain w-full h-full grayscale opacity-50 scale-110"
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
                                                    {progress && progress.target > 0 && (
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

            {/* Celebration Modal */}
            <BadgeCelebration
                badge={currentCelebration || selectedBadge}
                onClose={() => {
                    if (currentCelebration) dismissCelebration(currentCelebration.id)
                    setSelectedBadge(null)
                }}
            />
        </Card>
    )
}
