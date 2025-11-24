import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import {
  fetchUserProfile,
  type UserProfile,
} from '@/lib/bucket-list-service'

// Cache configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
}

// Hook for fetching user profile
export function useUserProfile(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['user-profile', userId] : null,
    () => fetchUserProfile(userId!),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate,
  }
}
