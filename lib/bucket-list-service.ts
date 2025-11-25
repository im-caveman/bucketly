import { supabase } from './supabase'
import { handleSupabaseError, logError } from './error-handler'
import type {
  Category,
  Difficulty,
  TimelineEventType,
  BucketList,
  BucketItem,
  Profile,
  BucketListInsert,
  BucketListUpdate,
  BucketItemInsert,
  BucketItemUpdate,
  MemoryInsert,
  MemoryUpdate,
  ListFollowerInsert,
  TimelineEventInsert,
  ProfileUpdate,
} from '@/types/supabase'

export interface BucketListWithItems {
  id: string
  user_id: string
  name: string
  description: string | null
  category: Category
  is_public: boolean
  follower_count: number
  created_at: string
  updated_at: string
  bucket_items: BucketItem[]
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export async function fetchUserBucketLists(userId: string) {
  try {
    const { data, error } = await supabase
      .from('bucket_lists')
      .select(`
        id,
        user_id,
        name,
        description,
        category,
        is_public,
        follower_count,
        created_at,
        updated_at,
        bucket_items (
          id,
          bucket_list_id,
          title,
          description,
          points,
          difficulty,
          location,
          completed,
          completed_date,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logError(error, { context: 'fetchUserBucketLists', userId })
      throw handleSupabaseError(error)
    }

    return data as BucketListWithItems[]
  } catch (error) {
    logError(error, { context: 'fetchUserBucketLists', userId })
    throw handleSupabaseError(error)
  }
}

export async function fetchPublicBucketLists(
  category?: Category,
  userId?: string,
  page: number = 0,
  pageSize: number = 20
) {
  try {
    const from = page * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('bucket_lists')
      .select(`
        id,
        user_id,
        name,
        description,
        category,
        is_public,
        follower_count,
        created_at,
        updated_at,
        bucket_items (
          id,
          bucket_list_id,
          title,
          description,
          points,
          difficulty,
          location,
          completed,
          completed_date,
          created_at,
          updated_at
        ),
        profiles (username, avatar_url)
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      logError(error, { context: 'fetchPublicBucketLists', category, userId })
      throw handleSupabaseError(error)
    }

    // Check following status for each list if user is logged in
    let lists = data as BucketListWithItems[]
    if (userId && data) {
      const listIds = data.map(list => list.id)
      const { data: followData } = await supabase
        .from('list_followers')
        .select('bucket_list_id')
        .eq('user_id', userId)
        .in('bucket_list_id', listIds)

      const followedListIds = new Set(followData?.map(f => f.bucket_list_id) || [])

      lists = data.map(list => ({
        ...list,
        isFollowing: followedListIds.has(list.id)
      })) as (BucketListWithItems & { isFollowing: boolean })[]
    }

    return {
      data: lists,
      count: count || 0,
      hasMore: count ? count > to + 1 : false
    }
  } catch (error) {
    logError(error, { context: 'fetchPublicBucketLists', category, userId })
    throw handleSupabaseError(error)
  }
}

export async function fetchBucketListById(listId: string, userId?: string) {
  const { data, error } = await supabase
    .from('bucket_lists')
    .select(`
      id,
      user_id,
      name,
      description,
      category,
      is_public,
      follower_count,
      created_at,
      updated_at,
      bucket_items (
        id,
        bucket_list_id,
        title,
        description,
        points,
        difficulty,
        location,
        completed,
        completed_date,
        created_at,
        updated_at
      ),
      profiles (username, avatar_url)
    `)
    .eq('id', listId)
    .single()

  if (error) {
    throw error
  }

  // Check if user is following this list
  let isFollowing = false
  if (userId) {
    const { data: followData } = await supabase
      .from('list_followers')
      .select('id')
      .eq('user_id', userId)
      .eq('bucket_list_id', listId)
      .maybeSingle()

    isFollowing = !!followData
  }

  return { ...data, isFollowing } as BucketListWithItems & { isFollowing: boolean }
}

export async function searchBucketLists(searchQuery: string, category?: Category, userId?: string) {
  let query = supabase
    .from('bucket_lists')
    .select(`
      id,
      user_id,
      name,
      description,
      category,
      is_public,
      follower_count,
      created_at,
      updated_at,
      bucket_items (
        id,
        bucket_list_id,
        title,
        description,
        points,
        difficulty,
        location,
        completed,
        completed_date,
        created_at,
        updated_at
      ),
      profiles (username, avatar_url)
    `)
    .eq('is_public', true)
    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .limit(50) // Limit search results for performance

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Check following status for each list if user is logged in
  if (userId && data && data.length > 0) {
    const listIds = data.map(list => list.id)
    const { data: followData } = await supabase
      .from('list_followers')
      .select('bucket_list_id')
      .eq('user_id', userId)
      .in('bucket_list_id', listIds)

    const followedListIds = new Set(followData?.map(f => f.bucket_list_id) || [])

    return data.map(list => ({
      ...list,
      isFollowing: followedListIds.has(list.id)
    })) as (BucketListWithItems & { isFollowing: boolean })[]
  }

  return data as BucketListWithItems[]
}

export type UpdateBucketListData = Omit<BucketListUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'follower_count'>

export async function updateBucketList(listId: string, updates: UpdateBucketListData) {
  const { data, error } = await supabase
    .from('bucket_lists')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteBucketList(listId: string) {
  const { error } = await supabase
    .from('bucket_lists')
    .delete()
    .eq('id', listId)

  if (error) {
    throw error
  }
}

// Bucket Item Management Functions

export type AddBucketItemData = Omit<BucketItemInsert, 'id' | 'bucket_list_id' | 'completed' | 'completed_date' | 'created_at' | 'updated_at'>

export async function addBucketItem(listId: string, itemData: AddBucketItemData) {
  const { data, error } = await supabase
    .from('bucket_items')
    .insert({
      bucket_list_id: listId,
      title: itemData.title,
      description: itemData.description,
      points: itemData.points,
      difficulty: itemData.difficulty,
      location: itemData.location,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function toggleItemCompletion(itemId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('bucket_items')
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Recalculate global ranks after item completion
  if (completed) {
    await recalculateGlobalRanks()
  }

  return data
}

// Rank calculation function
export async function recalculateGlobalRanks() {
  const { error } = await supabase.rpc('recalculate_global_ranks')

  if (error) {
    console.error('Error recalculating global ranks:', error)
    // Don't throw error to avoid blocking the main operation
  }
}

export type UpdateBucketItemData = Omit<BucketItemUpdate, 'id' | 'bucket_list_id' | 'completed' | 'completed_date' | 'created_at' | 'updated_at'>

export async function updateBucketItem(itemId: string, updates: UpdateBucketItemData) {
  const { data, error } = await supabase
    .from('bucket_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteBucketItem(itemId: string) {
  const { error } = await supabase
    .from('bucket_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw error
  }
}

// Memory Management Functions

export type CreateMemoryData = Omit<MemoryInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function createMemory(userId: string, memoryData: CreateMemoryData) {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      bucket_item_id: memoryData.bucket_item_id,
      reflection: memoryData.reflection,
      photos: memoryData.photos,
      is_public: memoryData.is_public,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function uploadMemoryPhoto(userId: string, file: File): Promise<string> {
  // Dynamically import image optimization to avoid SSR issues
  const { compressImage, validateImageFile } = await import('./image-optimization')

  // Validate the image file
  validateImageFile(file, 10) // 10MB max

  // Compress the image before upload
  const compressedFile = await compressImage(file, 2, 1920) // 2MB max, 1920px max dimension

  const fileExt = compressedFile.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('memory-photos')
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('memory-photos')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function fetchMemoriesForItem(itemId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select(`
      id,
      user_id,
      bucket_item_id,
      reflection,
      photos,
      is_public,
      created_at,
      updated_at,
      profiles (username, avatar_url)
    `)
    .eq('bucket_item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function fetchMemoriesForUser(userId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select(`
      id,
      user_id,
      bucket_item_id,
      reflection,
      photos,
      is_public,
      created_at,
      updated_at,
      bucket_items (
        id,
        title,
        bucket_list_id,
        bucket_lists (
          id,
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export type UpdateMemoryData = Omit<MemoryUpdate, 'id' | 'user_id' | 'bucket_item_id' | 'created_at' | 'updated_at'>

export async function updateMemory(memoryId: string, updates: UpdateMemoryData) {
  const { data, error } = await supabase
    .from('memories')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteMemory(memoryId: string) {
  // First, fetch the memory to get photo URLs
  const { data: memory, error: fetchError } = await supabase
    .from('memories')
    .select('photos, user_id')
    .eq('id', memoryId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Delete photos from storage
  if (memory.photos && Array.isArray(memory.photos) && memory.photos.length > 0) {
    const photoPaths = (memory.photos as string[]).map((url: string) => {
      // Extract the path from the public URL
      const urlParts = url.split('/memory-photos/')
      return urlParts[1] || url
    })

    const { error: storageError } = await supabase.storage
      .from('memory-photos')
      .remove(photoPaths)

    if (storageError) {
      console.error('Error deleting photos from storage:', storageError)
      // Continue with memory deletion even if photo deletion fails
    }
  }

  // Delete the memory record
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)

  if (error) {
    throw error
  }
}

export async function deleteMemoryPhoto(photoUrl: string) {
  // Extract the path from the public URL
  const urlParts = photoUrl.split('/memory-photos/')
  const photoPath = urlParts[1]

  if (!photoPath) {
    throw new Error('Invalid photo URL')
  }

  const { error } = await supabase.storage
    .from('memory-photos')
    .remove([photoPath])

  if (error) {
    throw error
  }
}

// Social Features - List Following Functions

export async function followBucketList(userId: string, listId: string) {
  const { data, error } = await supabase
    .from('list_followers')
    .insert({
      user_id: userId,
      bucket_list_id: listId,
    })
    .select()
    .single()

  if (error) {
    // Check if already following
    if (error.code === '23505') {
      throw new Error('You are already following this list')
    }
    throw error
  }

  return data
}

export async function unfollowBucketList(userId: string, listId: string) {
  const { error } = await supabase
    .from('list_followers')
    .delete()
    .eq('user_id', userId)
    .eq('bucket_list_id', listId)

  if (error) {
    throw error
  }
}

export async function checkIfFollowing(userId: string, listId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('list_followers')
    .select('id')
    .eq('user_id', userId)
    .eq('bucket_list_id', listId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return !!data
}

// Social Feed Functions

export interface TimelineEventWithProfile {
  id: string
  user_id: string
  event_type: TimelineEventType
  title: string
  description: string | null
  metadata: any
  is_public: boolean
  created_at: string
  username: string
  avatar_url: string | null
}

export async function fetchSocialFeed(userId: string, page: number = 0, pageSize: number = 20) {
  // Get list of users that the current user follows (via their lists)
  const { data: followedLists, error: followError } = await supabase
    .from('list_followers')
    .select('bucket_list_id, bucket_lists!inner(user_id)')
    .eq('user_id', userId)

  if (followError) {
    throw followError
  }

  // Extract unique user IDs from followed lists
  const followedUserIds = Array.from(
    new Set(
      followedLists
        ?.map((f: any) => f.bucket_lists?.user_id)
        .filter(Boolean) || []
    )
  )

  // If not following anyone, return empty array
  if (followedUserIds.length === 0) {
    return { events: [], hasMore: false }
  }

  // Fetch timeline events from followed users using the view
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('user_feed_view')
    .select(`
      id,
      user_id,
      event_type,
      title,
      description,
      metadata,
      created_at,
      username,
      avatar_url
    `, { count: 'exact' })
    .in('user_id', followedUserIds)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    events: (data || []) as TimelineEventWithProfile[],
    hasMore: count ? count > to + 1 : false
  }
}

export async function fetchFollowedUsers(userId: string) {
  const { data, error } = await supabase
    .from('list_followers')
    .select(`
      bucket_list_id,
      bucket_lists (
        user_id,
        profiles (
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  // Extract unique users
  const usersMap = new Map()
  data?.forEach((item: any) => {
    const profile = item.bucket_lists?.profiles
    if (profile && !usersMap.has(profile.id)) {
      usersMap.set(profile.id, profile)
    }
  })

  return Array.from(usersMap.values())
}

export async function fetchTrendingBucketLists(userId?: string, limit: number = 20) {
  // Get lists with recent follower activity (created in last 30 days with followers)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let query = supabase
    .from('bucket_lists')
    .select(`
      id,
      user_id,
      name,
      description,
      category,
      is_public,
      follower_count,
      created_at,
      updated_at,
      bucket_items (
        id,
        bucket_list_id,
        title,
        description,
        points,
        difficulty,
        location,
        completed,
        completed_date,
        created_at,
        updated_at
      ),
      profiles (username, avatar_url)
    `)
    .eq('is_public', true)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('follower_count', { ascending: false })
    .limit(limit)

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Check following status for each list if user is logged in
  if (userId && data && data.length > 0) {
    const listIds = data.map(list => list.id)
    const { data: followData } = await supabase
      .from('list_followers')
      .select('bucket_list_id')
      .eq('user_id', userId)
      .in('bucket_list_id', listIds)

    const followedListIds = new Set(followData?.map(f => f.bucket_list_id) || [])

    return data.map(list => ({
      ...list,
      isFollowing: followedListIds.has(list.id)
    })) as (BucketListWithItems & { isFollowing: boolean })[]
  }

  return data as BucketListWithItems[]
}

// Timeline Functions

export interface TimelineEventData {
  id: string
  user_id: string
  event_type: TimelineEventType
  title: string
  description: string | null
  metadata: any
  is_public: boolean
  created_at: string
}

export async function fetchUserTimeline(userId: string, page: number = 0, pageSize: number = 50) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('timeline_events')
    .select(`
      id,
      user_id,
      event_type,
      title,
      description,
      metadata,
      is_public,
      created_at
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    data: data as TimelineEventData[],
    count: count || 0,
    hasMore: count ? count > to + 1 : false
  }
}

export async function createTimelineEvent(
  userId: string,
  eventType: TimelineEventType,
  title: string,
  description: string | null,
  metadata: any = {},
  isPublic: boolean = true
) {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      title,
      description,
      metadata,
      is_public: isPublic,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as TimelineEventData
}

// Profile Functions

export type UserProfile = Profile

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      bio,
      total_points,
      global_rank,
      items_completed,
      lists_following,
      lists_created,
      created_at,
      updated_at
    `)
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data as UserProfile
}

export type UpdateProfileData = Pick<ProfileUpdate, 'username' | 'avatar_url' | 'bio' | 'twitter_url' | 'instagram_url' | 'linkedin_url' | 'github_url' | 'website_url'>

export async function updateUserProfile(userId: string, updates: Partial<UpdateProfileData>): Promise<UserProfile> {
  // Validate username if provided
  if (updates.username) {
    if (updates.username.length < 3 || updates.username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters')
    }

    // Check username uniqueness
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', updates.username)
      .neq('id', userId)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existingUser) {
      throw new Error('Username is already taken')
    }
  }

  // Validate bio if provided
  if (updates.bio && updates.bio.length > 500) {
    throw new Error('Bio must be 500 characters or less')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as UserProfile
}

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  // Dynamically import image optimization to avoid SSR issues
  const { compressImage, validateImageFile } = await import('./image-optimization')

  // Validate the image file
  validateImageFile(file, 5) // 5MB max

  // Compress the avatar image
  const compressedFile = await compressImage(file, 0.5, 512) // 500KB max, 512px max dimension

  const fileExt = compressedFile.name.split('.').pop()
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Delete old avatar if exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()

  if (profile?.avatar_url) {
    const oldPath = profile.avatar_url.split('/avatars/')[1]
    if (oldPath && oldPath.startsWith(userId)) {
      await supabase.storage
        .from('avatars')
        .remove([oldPath])
    }
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function updateProfileStats(userId: string): Promise<void> {
  const { error } = await supabase.rpc('update_profile_stats', {
    user_uuid: userId
  })

  if (error) {
    console.error('Error updating profile stats:', error)
    throw error
  }
}

export function subscribeToProfileUpdates(
  userId: string,
  callback: (profile: UserProfile) => void
) {
  const channel = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as UserProfile)
      }
    )
    .subscribe()

  return channel
}

// Badge Functions

export interface Badge {
  id: string
  name: string
  description: string | null
  icon_url: string
  criteria: any
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  badges: Badge
}

export async function fetchBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Badge[]
}

export async function createBadge(badgeData: Omit<Badge, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('badges')
    .insert(badgeData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Badge
}

export async function updateBadge(badgeId: string, updates: Partial<Badge>) {
  const { data, error } = await supabase
    .from('badges')
    .update(updates)
    .eq('id', badgeId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Badge
}

export async function fetchUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      id,
      user_id,
      badge_id,
      awarded_at,
      badges (
        id,
        name,
        description,
        icon_url,
        criteria
      )
    `)
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as UserBadge[]
}

export async function awardBadge(userId: string, badgeId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    })
    .select()
    .single()

  if (error) {
    // Ignore duplicate key error (already awarded)
    if (error.code === '23505') {
      return null
    }
    throw error
  }

  return data
}

export async function uploadBadgeIcon(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `badge-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('badges')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('badges')
    .getPublicUrl(filePath)

  return data.publicUrl
}
