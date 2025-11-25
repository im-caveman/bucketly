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

  // Prevent self-following
  if (user.id === followingId) {
    throw new Error("You cannot follow yourself")
  }

  const { error } = await supabase
    .from("user_follows")
    .insert({
      follower_id: user.id,
      following_id: followingId,
    })

  if (error) {
    console.error("Follow error details:", error)
    // Handle specific error cases
    if (error.code === "23505") { // Unique constraint violation
      throw new Error("You are already following this user")
    }
    if (error.code === "23503") { // Foreign key violation
      throw new Error("User not found")
    }
    if (error.code === "23514") { // Check constraint violation
      throw new Error("Invalid follow operation")
    }
    // Generic error with more details
    throw new Error(error.message || "Failed to follow user")
  }
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

  if (error) {
    console.error("Unfollow error details:", error)
    // Generic error with more details
    throw new Error(error.message || "Failed to unfollow user")
  }
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
  // 1. Get follower IDs
  const { data: follows, error: followsError } = await supabase
    .from("user_follows")
    .select("id, follower_id, created_at")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })

  if (followsError) throw followsError
  if (!follows || follows.length === 0) return []

  const followerIds = follows.map(f => f.follower_id)

  // 2. Get profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .in("id", followerIds)

  if (profilesError) throw profilesError

  // 3. Merge data
  const profilesMap = new Map(profiles?.map(p => [p.id, p]))

  return follows.map(f => ({
    ...f,
    follower: profilesMap.get(f.follower_id)
  })).filter(f => f.follower)
}

/**
 * Get users that a user is following
 */
export async function getUserFollowing(userId: string) {
  // 1. Get following IDs
  const { data: follows, error: followsError } = await supabase
    .from("user_follows")
    .select("id, following_id, created_at")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })

  if (followsError) throw followsError
  if (!follows || follows.length === 0) return []

  const followingIds = follows.map(f => f.following_id)

  // 2. Get profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .in("id", followingIds)

  if (profilesError) throw profilesError

  // 3. Merge data
  const profilesMap = new Map(profiles?.map(p => [p.id, p]))

  return follows.map(f => ({
    ...f,
    following: profilesMap.get(f.following_id)
  })).filter(f => f.following)
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
