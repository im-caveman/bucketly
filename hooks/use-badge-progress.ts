"use client"

import useSWR from 'swr'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useUserProfile } from './use-profile'
import { useBadges, useUserBadges } from './use-badges'
import { calculateSingleBadgeProgress, checkAndAwardBadges, type BadgeProgressMap } from '@/lib/badge-progress-service'
import { subscribeToProfileUpdates } from '@/lib/bucket-list-service'
import type { Badge } from '@/lib/bucket-list-service'

/**
 * Custom hook that provides real-time badge progress
 * It combines profile data, badge definitions, and earned badges
 * and recalculates progress whenever any of them change.
 */
export function useBadgeProgress(userId: string | undefined) {
    const { profile, mutate: mutateProfile } = useUserProfile(userId)
    const { badges, isLoading: badgesLoading } = useBadges()
    const { userBadges, isLoading: userBadgesLoading, mutate: mutateUserBadges } = useUserBadges(userId)

    // Queue for celebration (badges that were just earned)
    const [celebrationQueue, setCelebrationQueue] = useState<Badge[]>([])

    // Subscribe to profile updates to ensure real-time progress updates
    useEffect(() => {
        if (!userId) return

        const channel = subscribeToProfileUpdates(userId, () => {
            mutateProfile()
            mutateUserBadges()
        })

        return () => {
            channel.unsubscribe()
        }
    }, [userId, mutateProfile, mutateUserBadges])

    // Calculate progress map
    const progressMap = useMemo(() => {
        if (!userId || !profile || !badges) return {}

        const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])
        const map: BadgeProgressMap = {}

        // Import calculateSingleBadgeProgress dynamically or ensure it's exported
        // We'll use the logic from the service but since it's a memo, 
        // we can actually call the synchronous version if we export it.
        // For now, let's assume we can call the service logic.

        // Note: calculateBadgeProgress is async because it fetches data.
        // But we already have the data here. So we should use a sync version.
        // I've exported calculateSingleBadgeProgress in the service.


        for (const badge of badges) {
            map[badge.id] = calculateSingleBadgeProgress(
                badge,
                profile,
                earnedBadgeIds.has(badge.id)
            )
        }

        return map
    }, [userId, profile, badges, userBadges])

    // Auto-sync: If there are unearned badges that reach 100%, trigger awarding
    // This handles retroactive awarding for existing users
    useEffect(() => {
        if (!userId || badgesLoading || userBadgesLoading || !progressMap || !badges) return

        const unearnedbutComplete = Object.values(progressMap).filter(
            p => !p.isEarned && p.percentage >= 100
        )

        if (unearnedbutComplete.length > 0) {
            console.log('Detected unearned but complete badges, triggering sync...')
            checkAndAwardBadges(userId).then((newlyAwardedIds) => {
                if (newlyAwardedIds.length > 0) {
                    const newlyAwardedBadges = badges.filter(b => newlyAwardedIds.includes(b.id))
                    setCelebrationQueue(prev => [...prev, ...newlyAwardedBadges])
                    mutateUserBadges()
                }
            })
        }
    }, [userId, progressMap, badgesLoading, userBadgesLoading, mutateUserBadges, badges])

    const dismissCelebration = useCallback((badgeId: string) => {
        setCelebrationQueue(prev => prev.filter(b => b.id !== badgeId))
    }, [])

    const isLoading = badgesLoading || userBadgesLoading

    return {
        progressMap,
        badges,
        earnedBadges: badges?.filter(b => progressMap[b.id]?.isEarned) || [],
        lockedBadges: badges?.filter(b => !progressMap[b.id]?.isEarned) || [],
        isLoading,
        celebrationQueue,
        dismissCelebration,
        mutate: () => {
            mutateProfile()
            mutateUserBadges()
        }
    }
}
