import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import {
    fetchBadges,
    fetchUserBadges,
    type Badge,
    type UserBadge,
} from '@/lib/bucket-list-service'

// Cache configuration
const defaultConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
}

// Hook for fetching all available badges
export function useBadges() {
    const { data, error, isLoading, mutate } = useSWR(
        'all-badges',
        fetchBadges,
        defaultConfig
    )

    return {
        badges: data,
        isLoading,
        isError: error,
        mutate,
    }
}

// Hook for fetching a specific user's badges
export function useUserBadges(userId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? ['user-badges', userId] : null,
        () => fetchUserBadges(userId!),
        defaultConfig
    )

    return {
        userBadges: data,
        isLoading,
        isError: error,
        mutate,
    }
}
