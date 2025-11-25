import useSWR from 'swr'
import { getUserFollowers, getUserFollowing } from '@/lib/user-follow-service'

export function useFollowers(userId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? `followers-${userId}` : null,
        () => userId ? getUserFollowers(userId) : null
    )

    return {
        followers: data,
        error,
        isLoading,
        mutate
    }
}

export function useFollowing(userId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? `following-${userId}` : null,
        () => userId ? getUserFollowing(userId) : null
    )

    return {
        following: data,
        error,
        isLoading,
        mutate
    }
}
