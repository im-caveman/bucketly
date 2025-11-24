import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import {
  fetchUserTimeline,
  fetchSocialFeed,
  type TimelineEventData,
  type TimelineEventWithProfile,
} from '@/lib/bucket-list-service'

// Cache configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
}

// Hook for fetching user timeline with pagination
export function useUserTimeline(userId: string | undefined, page: number = 0, pageSize: number = 50) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['user-timeline', userId, page, pageSize] : null,
    () => fetchUserTimeline(userId!, page, pageSize),
    {
      ...defaultConfig,
      revalidateOnMount: true,
      keepPreviousData: true,
    }
  )

  return {
    events: data?.data,
    count: data?.count,
    hasMore: data?.hasMore,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching social feed with pagination
export function useSocialFeed(userId: string | undefined, page: number = 0, pageSize: number = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['social-feed', userId, page, pageSize] : null,
    () => fetchSocialFeed(userId!, page, pageSize),
    {
      ...defaultConfig,
      revalidateOnMount: true,
      keepPreviousData: true, // Keep previous data while loading new page
    }
  )

  return {
    events: data?.events,
    hasMore: data?.hasMore,
    isLoading,
    isError: error,
    mutate,
  }
}
