import { supabase } from "./supabase"

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

/**
 * Follow a user
 */
export async function followUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("user_follows")
    .insert({
      follower_id: user.id,
      following_id: followingId,
    })

  if (error) throw error
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId)

  if (error) throw error
}

/**
 * Check if current user is following another user
 */
export async function isFollowingUser(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return !!data
}

/**
 * Get user's followers
 */
export async function getUserFollowers(userId: string) {
  const { data, error } = await supabase
    .from("user_follows")
    .select(`
      id,
      created_at,
      follower:follower_id (
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get users that a user is following
 */
export async function getUserFollowing(userId: string) {
  const { data, error } = await supabase
    .from("user_follows")
    .select(`
      id,
      created_at,
      following:following_id (
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get follower counts for a user
 */
export async function getUserFollowerCounts(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("followers_count, following_count")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}
