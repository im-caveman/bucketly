import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import {
  fetchMemoriesForItem,
  fetchMemoriesForUser,
} from '@/lib/bucket-list-service'

// Cache configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
}

// Hook for fetching memories for a specific item
export function useItemMemories(itemId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    itemId ? ['item-memories', itemId] : null,
    () => fetchMemoriesForItem(itemId!),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    memories: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching all memories for a user
export function useUserMemories(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['user-memories', userId] : null,
    () => fetchMemoriesForUser(userId!),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    memories: data,
    isLoading,
    isError: error,
    mutate,
  }
}
