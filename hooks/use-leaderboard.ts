import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'
import { supabase } from '@/lib/supabase'

interface LeaderboardViewRow {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  total_points: number
  global_rank: number | null
  items_completed: number
  current_rank: number
  twitter_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
}

interface LeaderboardUser {
  id: string
  rank: number
  username: string
  avatar_url: string | null
  bio: string | null
  points: number
  completions: number
  current_rank: number
  twitter_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
}

// Cache configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  refreshInterval: 60000, // Refresh every minute
}

// Fetcher function for leaderboard
async function fetchLeaderboard(limit: number = 100): Promise<LeaderboardUser[]> {
  const { data, error } = await (limit ?
    supabase.from('leaderboard_view').select('*') :
    supabase.from('leaderboard_view').select('*')
  )
    .order('total_points', { ascending: false })
    .limit(limit)

  if (error) {
    // If is_private filter failed, try without it
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('leaderboard_view')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit)

    if (fallbackError) throw fallbackError
    return (fallbackData as any[]).map((row) => ({
      id: row.id,
      rank: row.current_rank,
      username: row.username,
      avatar_url: row.avatar_url,
      points: row.total_points,
      completions: row.items_completed,
      current_rank: row.current_rank,
    }))
  }

  return (data as LeaderboardViewRow[]).map((row) => ({
    id: row.id,
    rank: row.current_rank,
    username: row.username,
    avatar_url: row.avatar_url,
    points: row.total_points,
    completions: row.items_completed,
    current_rank: row.current_rank,
  }))
}

// Fetcher function for user rank
async function fetchUserRank(userId: string): Promise<LeaderboardUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error

  if (!data) return null

  return {
    id: (data as any).id,
    rank: (data as any).global_rank || 0,
    username: (data as any).username,
    avatar_url: (data as any).avatar_url,
    points: (data as any).total_points,
    completions: (data as any).items_completed,
    current_rank: (data as any).global_rank || 0,
  }
}

// Hook for fetching leaderboard with pagination
export function useLeaderboard(page: number = 0, pageSize: number = 50) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, isLoading, mutate } = useSWR(
    ['leaderboard', page, pageSize],
    async () => {
      const query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('total_points', { ascending: false })
        .range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const leaderboard = (data as any[]).map((row, index) => ({
        id: row.id,
        rank: from + index + 1,
        username: row.username,
        avatar_url: row.avatar_url,
        bio: row.bio,
        points: row.total_points,
        completions: row.items_completed,
        current_rank: from + index + 1,
        twitter_url: row.twitter_url,
        instagram_url: row.instagram_url,
        linkedin_url: row.linkedin_url,
        github_url: row.github_url,
        website_url: row.website_url,
      }))

      return {
        data: leaderboard,
        count: count || 0,
        hasMore: count ? count > to + 1 : false
      }
    },
    {
      ...defaultConfig,
      revalidateOnMount: true,
      keepPreviousData: true,
    }
  )

  return {
    leaderboard: data?.data,
    count: data?.count,
    hasMore: data?.hasMore,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook for fetching current user's rank
export function useUserRank(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['user-rank', userId] : null,
    () => fetchUserRank(userId!),
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  )

  return {
    userRank: data,
    isLoading,
    isError: error,
    mutate,
  }
}
