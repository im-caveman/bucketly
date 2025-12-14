import { supabase } from './supabase'
import type { UserProfile } from '@/types/bucket-list'

export interface BadgeProgress {
    badgeId: string
    current: number
    target: number
    percentage: number
    isEarned: boolean
}

export interface BadgeProgressMap {
    [badgeId: string]: BadgeProgress
}

/**
 * Calculate progress for all badges for a given user
 * This function is optimized to make minimal database calls
 * and uses the user's profile data which is already cached
 */
export async function calculateBadgeProgress(
    userId: string,
    userProfile?: UserProfile
): Promise<BadgeProgressMap> {
    // If profile not provided, fetch it (should be cached by SWR)
    let profile = userProfile
    if (!profile) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !data) {
            console.error('Error fetching user profile:', error)
            return {}
        }
        profile = data as UserProfile
    }

    // Fetch all badges (this will be cached by SWR in the hook)
    const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('id, criteria')

    if (badgesError || !badges) {
        console.error('Error fetching badges:', badgesError)
        return {}
    }

    // Fetch user's earned badges (this will be cached by SWR in the hook)
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)

    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])

    // Calculate progress for each badge
    const progressMap: BadgeProgressMap = {}

    for (const badge of badges) {
        const isEarned = earnedBadgeIds.has(badge.id)
        const criteria = badge.criteria as any

        if (!criteria || !criteria.type) {
            progressMap[badge.id] = {
                badgeId: badge.id,
                current: 0,
                target: 0,
                percentage: 0,
                isEarned,
            }
            continue
        }

        let current = 0
        let target = criteria.target || 0

        // Calculate current progress based on criteria type
        switch (criteria.type) {
            case 'items_completed':
                current = profile.items_completed || 0
                break
            case 'lists_created':
                current = profile.lists_created || 0
                break
            case 'lists_following':
                current = profile.lists_following || 0
                break
            case 'total_points':
                current = profile.total_points || 0
                break
            case 'global_rank':
                // For rank, lower is better, so we calculate differently
                const currentRank = profile.global_rank || 999999
                target = criteria.target || 1
                current = currentRank <= target ? target : 0
                break
            default:
                current = 0
                target = 0
        }

        const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

        progressMap[badge.id] = {
            badgeId: badge.id,
            current,
            target,
            percentage,
            isEarned,
        }
    }

    return progressMap
}

/**
 * Check if a user has earned a badge based on their current progress
 * This is called after profile updates to automatically award badges
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
    const progressMap = await calculateBadgeProgress(userId)
    const newlyAwardedBadges: string[] = []

    for (const [badgeId, progress] of Object.entries(progressMap)) {
        // If badge is not earned but progress is 100%, award it
        if (!progress.isEarned && progress.percentage >= 100) {
            const { error } = await supabase
                .from('user_badges')
                .insert({
                    user_id: userId,
                    badge_id: badgeId,
                })

            if (!error) {
                newlyAwardedBadges.push(badgeId)

                // Create a notification for the new badge
                await supabase.from('notifications').insert({
                    user_id: userId,
                    type: 'achievement_unlocked',
                    title: 'New Badge Earned!',
                    message: 'You\'ve unlocked a new achievement badge!',
                    metadata: { badge_id: badgeId },
                })
            } else if (error.code !== '23505') {
                // Ignore duplicate key errors (badge already awarded)
                console.error('Error awarding badge:', error)
            }
        }
    }

    return newlyAwardedBadges
}
