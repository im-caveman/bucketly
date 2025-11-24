import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import {
  fetchUserBucketLists,
  fetchPublicBucketLists,
  fetchBucketListById,
  searchBucketLists,
  fetchTrendingBucketLists,
  type BucketListWithItems,
} from '@/lib/bucket-list-service'
import type { Category } from '@/types/supabase'

// Cache configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
}

// Hook for fetching user's bucket lists
export function useUserBucketLists(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['user-bucket-lists', userId] : null,
    () => fetchUserBucketLists(userId!),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    bucketLists: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching public bucket lists with pagination
export function usePublicBucketLists(category?: Category, userId?: string, page: number = 0, pageSize: number = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    ['public-bucket-lists', category, userId, page, pageSize],
    () => fetchPublicBucketLists(category, userId, page, pageSize),
    {
      ...defaultConfig,
      revalidateOnMount: true,
      keepPreviousData: true,
    }
  )

  return {
    bucketLists: data?.data,
    count: data?.count,
    hasMore: data?.hasMore,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching a single bucket list
export function useBucketList(listId: string | undefined, userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    listId ? ['bucket-list', listId, userId] : null,
    () => fetchBucketListById(listId!, userId),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    bucketList: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for searching bucket lists
export function useSearchBucketLists(searchQuery: string, category?: Category, userId?: string) {
  const shouldFetch = searchQuery.trim().length > 0

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['search-bucket-lists', searchQuery, category, userId] : null,
    () => searchBucketLists(searchQuery, category, userId),
    {
      ...defaultConfig,
      revalidateOnMount: true,
      dedupingInterval: 500, // Shorter deduping for search
    }
  )

  return {
    bucketLists: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching trending bucket lists
export function useTrendingBucketLists(userId?: string, limit: number = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    ['trending-bucket-lists', userId, limit],
    () => fetchTrendingBucketLists(userId, limit),
    {
      ...defaultConfig,
      revalidateOnMount: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )

  return {
    bucketLists: data,
    isLoading,
    isError: error,
    mutate,
  }
}
