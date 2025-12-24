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
  GlobalItem,
} from '@/types/supabase'
import { checkAndAwardBadges } from './badge-progress-service'
import type { BucketListWithItems, UserProfile as BucketUserProfile } from '@/types/bucket-list'

/**
 * Audit log interface
 */
export interface AuditLogInsert {
  user_id: string
  action: string
  target_id?: string
  target_type?: string
  status: 'allowed' | 'denied' | 'error'
  metadata?: any
}

/**
 * Log an action to the audit_logs table
 */
export async function logAuditAction(log: AuditLogInsert) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: log.user_id,
        action: log.action,
        target_id: log.target_id,
        target_type: log.target_type,
        status: log.status,
        metadata: log.metadata,
      })

    if (error) {
      console.error('Failed to log audit action:', error)
    }
  } catch (err) {
    console.error('Error in logAuditAction:', err)
  }
}

/**
 * Check if a list is a shadow clone (has an origin_id)
 */
export async function isShadowClone(listId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bucket_lists')
    .select('origin_id')
    .eq('id', listId)
    .single()

  if (error) return false
  return !!data.origin_id
}

export type { BucketListWithItems }

export async function fetchUserBucketLists(userId: string, onlyOwned: boolean = false) {
  try {
    // First, get all lists owned by the user
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
        origin_id,
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
      .eq('user_id', userId)

    if (onlyOwned) {
      query = query.is('origin_id', null)
    }

    const { data: allLists, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      logError(error, { context: 'fetchUserBucketLists', userId })
      throw handleSupabaseError(error)
    }

    if (onlyOwned) {
      // Robustly filter in memory as well to ensure no shadow copies slip through
      // regardless of DB state or query quirks
      return (allLists || []).filter(l => !l.origin_id) as BucketListWithItems[]
    }

    // Get all lists the user is following to filter shadow copies
    const { data: following } = await supabase
      .from('list_followers')
      .select('bucket_list_id')
      .eq('user_id', userId)

    const followedListIds = new Set(following?.map(f => f.bucket_list_id) || [])

    // Filter out shadow copies where user is not following the origin
    const filteredLists = (allLists || []).filter(list => {
      // If it's not a shadow copy (no origin_id), always show it
      if (!list.origin_id) return true

      // If it's a shadow copy, only show if user is following the origin
      return followedListIds.has(list.origin_id)
    })

    return filteredLists as BucketListWithItems[]
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
        origin_id,
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
        profiles!inner (username, avatar_url)
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
      origin_id,
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
      origin_id,
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
      profiles!inner (username, avatar_url)
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
    .is('origin_id', null) // Security: Prevent updating shadow clones
    .select()
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAuditAction({
      user_id: user.id,
      action: 'update_bucket_list',
      target_id: listId,
      target_type: 'bucket_list',
      status: error ? (error.code === 'PGRST116' ? 'denied' : 'error') : 'allowed',
      metadata: { updates, error_code: error?.code }
    })
  }

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Cannot modify a followed list')
    }
    throw error
  }

  return data
}

export interface CreateBucketListParams {
  userId: string
  name: string
  description?: string
  category: Category
  isPublic: boolean
  items: Array<{
    title: string
    description?: string
    points?: number
    difficulty?: Difficulty
    location?: string
    target_value?: number
    unit_type?: string
  }>
}

import { isAdminEmail } from '@/lib/admin-config'

// ... existing imports

export async function createBucketList({
  userId,
  name,
  description,
  category,
  isPublic,
  items,
}: CreateBucketListParams) {
  // Security check: Only admins can create public lists
  let finalIsPublic = false
  if (isPublic) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.id === userId && isAdminEmail(user.email)) {
      finalIsPublic = true
    }
  }

  // 1. Create the bucket list
  const { data: bucketList, error: listError } = await supabase
    .from('bucket_lists')
    .insert({
      user_id: userId,
      name: name.trim(),
      description: description?.trim() || null,
      category,
      is_public: finalIsPublic,
    })
    .select()
    .single()

  if (listError) {
    throw handleSupabaseError(listError)
  }

  // 2. Insert items if any
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      bucket_list_id: bucketList.id,
      title: item.title,
      description: item.description || null,
      points: item.points || 0,
      difficulty: item.difficulty || null,
      location: item.location || null,
      target_value: item.target_value || 0,
      unit_type: item.unit_type || null,
      current_value: 0,
    }))

    const { error: itemsError } = await supabase
      .from('bucket_items')
      .insert(itemsToInsert)

    if (itemsError) {
      throw handleSupabaseError(itemsError)
    }
  }

  // 3. Create timeline event
  await supabase.from('timeline_events').insert({
    user_id: userId,
    event_type: 'list_created',
    title: `Created: ${name}`,
    description: `Started a new ${category} bucket list`,
    metadata: {
      list_id: bucketList.id,
      category,
      items_count: items.length,
    },
    is_public: finalIsPublic,
  })

  // 4. Update stats and award badges
  await updateProfileStats(userId)
  await checkAndAwardBadges(userId)

  return bucketList
}

export async function deleteBucketList(listId: string) {
  const { error } = await supabase
    .from('bucket_lists')
    .delete()
    .eq('id', listId)
    .is('origin_id', null) // Security: Prevent deleting shadow clones

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAuditAction({
      user_id: user.id,
      action: 'delete_bucket_list',
      target_id: listId,
      target_type: 'bucket_list',
      status: error ? 'error' : 'allowed',
      metadata: { error_code: error?.code }
    })
  }

  if (error) {
    throw error
  }
  if (error) {
    throw error
  }
}

export async function cloneBucketList(userId: string, sourceListId: string) {
  // 1. Fetch the source list and its items
  const { data: sourceList, error: fetchError } = await supabase
    .from('bucket_lists')
    .select(`
      *,
      bucket_items (*)
    `)
    .eq('id', sourceListId)
    .single()

  if (fetchError || !sourceList) {
    throw new Error('Failed to fetch source list')
  }

  // 2. Create the new list for the current user
  const { data: newList, error: createError } = await supabase
    .from('bucket_lists')
    .insert({
      user_id: userId,
      name: sourceList.name, // Keep same name
      description: sourceList.description,
      category: sourceList.category,
      is_public: false, // Clone lists are always private by default
      origin_id: sourceListId, // Link to original list for shadow copy tracking
    })
    .select()
    .single()

  if (createError) {
    throw handleSupabaseError(createError)
  }

  // 3. Copy items
  if (sourceList.bucket_items && sourceList.bucket_items.length > 0) {
    const itemsToInsert = sourceList.bucket_items.map((item: any) => ({
      bucket_list_id: newList.id,
      title: item.title,
      description: item.description,
      points: item.points,
      difficulty: item.difficulty,
      location: item.location,
      target_value: item.target_value,
      unit_type: item.unit_type,
      current_value: 0, // Reset progress
      completed: false, // Reset completion
      completed_date: null
    }))

    const { error: itemsError } = await supabase
      .from('bucket_items')
      .insert(itemsToInsert)

    if (itemsError) {
      // Cleanup list if items fail?
      throw handleSupabaseError(itemsError)
    }
  }

  // 4. Create timeline event
  await supabase.from('timeline_events').insert({
    user_id: userId,
    event_type: 'list_created',
    title: `Added list: ${newList.name}`,
    description: `Started tracking "${newList.name}"`,
    metadata: {
      list_id: newList.id,
      original_list_id: sourceListId,
      category: newList.category,
    },
    is_public: false,
  })

  // 5. Update stats
  await updateProfileStats(userId)

  return newList
}

export async function fetchGlobalItems(
  category?: Category,
  searchQuery?: string,
  page: number = 0,
  pageSize: number = 20
) {
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('global_items')
    .select('*', { count: 'exact' })
    .order('points', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    data: data as GlobalItem[],
    count: count || 0,
    hasMore: count ? count > to + 1 : false
  }
}

// Bucket Item Management Functions

export type AddBucketItemData = Omit<BucketItemInsert, 'id' | 'bucket_list_id' | 'completed' | 'completed_date' | 'created_at' | 'updated_at'>

export async function addBucketItem(listId: string, itemData: AddBucketItemData) {
  // Check if target list is a shadow copy
  const isShadow = await isShadowClone(listId)
  const { data: { user } } = await supabase.auth.getUser()

  if (isShadow) {
    if (user) {
      await logAuditAction({
        user_id: user.id,
        action: 'add_bucket_item',
        target_id: listId,
        target_type: 'bucket_list',
        status: 'denied',
        metadata: { itemData }
      })
    }
    throw new Error('Cannot add items to a followed list')
  }

  const { data, error } = await supabase
    .from('bucket_items')
    .insert({
      bucket_list_id: listId,
      title: itemData.title,
      description: itemData.description,
      points: itemData.points,
      difficulty: itemData.difficulty,
      location: itemData.location,
      current_value: itemData.current_value,
      target_value: itemData.target_value,
      unit_type: itemData.unit_type,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function toggleItemCompletion(itemId: string, completed: boolean) {
  // 1. Get the item first to know its points and user_id (via bucket_list)
  const { data: item, error: fetchError } = await supabase
    .from('bucket_items')
    .select(`
      *,
      bucket_lists (
        user_id,
        category
      )
    `)
    .eq('id', itemId)
    .single()

  if (fetchError) throw fetchError
  if (!item) throw new Error('Item not found')

  const userId = item.bucket_lists?.user_id
  if (!userId) throw new Error('User not found for this item')



  // 2. Update the item status
  const { data, error } = await supabase
    .from('bucket_items')
    .update({
      completed,
      completed_date: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // 3. Handle side effects (Points & Timeline)
  // We use recalculation to ensure data consistency and avoid double counting
  await recalculateUserStats(userId)

  if (completed) {
    // Check if timeline event already exists to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('timeline_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'item_completed')
      .contains('metadata', { item_id: itemId })

    if (!existingEvents || existingEvents.length === 0) {
      await supabase.from('timeline_events').insert({
        user_id: userId,
        event_type: 'item_completed_personal', // Changed from item_completed to avoid triggering notifications to followers
        title: `Completed: ${item.title}`,
        description: item.description,
        metadata: {
          item_id: itemId,
          points: item.points,
          category: item.bucket_lists?.category
        },
        is_public: false
      })
    }
  } else {
    // Remove timeline event if unchecking
    await supabase
      .from('timeline_events')
      .delete()
      .eq('user_id', userId)
      .eq('event_type', 'item_completed')
      .contains('metadata', { item_id: itemId })
  }

  // Recalculate global ranks after item completion
  if (completed) {
    await recalculateGlobalRanks()
    // Award badges
    await checkAndAwardBadges(userId)
  }

  return data
}

export async function recalculateUserStats(userId: string) {
  // 1. Calculate total points and completed items from bucket_items
  const { data: items, error } = await supabase
    .from('bucket_items')
    .select('points, completed')
    .eq('completed', true)
    // We need to filter by user_id, but bucket_items doesn't have user_id directly.
    // We need to join with bucket_lists.
    // However, Supabase JS client doesn't support deep filtering easily in one go for aggregation.
    // So we fetch items for the user's lists.
    .not('points', 'is', null)

  if (error) {
    console.error('Error calculating stats:', error)
    return
  }

  // Filter items that belong to the user (via bucket_lists)
  // Since we can't easily do a join-filter-aggregate in one query without a view or RPC,
  // we'll fetch the user's lists first, then their items.

  const { data: userLists } = await supabase
    .from('bucket_lists')
    .select('id')
    .eq('user_id', userId)

  if (!userLists || userLists.length === 0) return

  const listIds = userLists.map(l => l.id)

  const { data: userItems } = await supabase
    .from('bucket_items')
    .select('points')
    .eq('completed', true)
    .in('bucket_list_id', listIds)

  const totalPoints = userItems?.reduce((sum, item) => sum + (item.points || 0), 0) || 0
  const itemsCompleted = userItems?.length || 0

  // 2. Update user stats
  await supabase
    .from('profiles')
    .update({
      total_points: totalPoints,
      items_completed: itemsCompleted
    })
    .eq('id', userId)
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
  // Security Check: If it's a shadow clone, only allow updating current_value
  const { data: itemData, error: fetchError } = await supabase
    .from('bucket_items')
    .select('bucket_lists(origin_id)')
    .eq('id', itemId)
    .single()

  const isShadow = !!(itemData as any)?.bucket_lists?.origin_id
  const { data: { user } } = await supabase.auth.getUser()

  if (isShadow) {
    // Only current_value is allowed for shadow clones
    const keys = Object.keys(updates)
    if (keys.length > 1 || (keys.length === 1 && keys[0] !== 'current_value')) {
      if (user) {
        await logAuditAction({
          user_id: user.id,
          action: 'update_bucket_item',
          target_id: itemId,
          target_type: 'bucket_item',
          status: 'denied',
          metadata: { updates }
        })
      }
      throw new Error('Followed list items cannot be edited')
    }
  }

  const { data, error } = await supabase
    .from('bucket_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (user) {
    await logAuditAction({
      user_id: user.id,
      action: 'update_bucket_item',
      target_id: itemId,
      target_type: 'bucket_item',
      status: error ? 'error' : 'allowed',
      metadata: { updates, is_shadow: isShadow }
    })
  }

  if (error) {
    throw error
  }

  return data
}

export async function deleteBucketItem(itemId: string) {
  // Check if it's a shadow clone
  const { data: itemData } = await supabase
    .from('bucket_items')
    .select('bucket_lists(origin_id)')
    .eq('id', itemId)
    .single()

  if ((itemData as any)?.bucket_lists?.origin_id) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logAuditAction({
        user_id: user.id,
        action: 'delete_bucket_item',
        target_id: itemId,
        target_type: 'bucket_item',
        status: 'denied'
      })
    }
    throw new Error('Followed list items cannot be deleted')
  }

  const { error } = await supabase
    .from('bucket_items')
    .delete()
    .eq('id', itemId)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAuditAction({
      user_id: user.id,
      action: 'delete_bucket_item',
      target_id: itemId,
      target_type: 'bucket_item',
      status: error ? 'error' : 'allowed'
    })
  }

  if (error) {
    throw error
  }
}

// Memory Management Functions

export type CreateMemoryData = Omit<MemoryInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function createMemory(userId: string, memoryData: CreateMemoryData) {
  // 1. Get item details for the timeline event
  const { data: item, error: itemError } = await supabase
    .from('bucket_items')
    .select(`
      *,
      bucket_lists (
        name,
        category
      )
    `)
    .eq('id', memoryData.bucket_item_id)
    .single()

  if (itemError) throw itemError
  if (!item) throw new Error('Item not found')

  // 2. Check for existing memory
  const { data: existingMemory } = await supabase
    .from('memories')
    .select('id')
    .eq('user_id', userId)
    .eq('bucket_item_id', memoryData.bucket_item_id)
    .maybeSingle()

  let memoryId: string
  let actionType: 'created' | 'updated' = 'created'

  if (existingMemory) {
    // Update existing
    const { data, error } = await supabase
      .from('memories')
      .update({
        reflection: memoryData.reflection,
        photos: memoryData.photos,
        is_public: memoryData.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMemory.id)
      .select()
      .single()

    if (error) throw error
    memoryId = data.id
    actionType = 'updated'
  } else {
    // Insert new
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

    if (error) throw error
    memoryId = data.id
  }

  // 3. Create timeline event if public
  if (memoryData.is_public) {
    const title = actionType === 'created'
      ? `Shared a memory: ${item.title}`
      : `Updated memory: ${item.title}`

    await supabase.from('timeline_events').insert({
      user_id: userId,
      event_type: 'memory_shared',
      title: title,
      description: memoryData.reflection,
      metadata: {
        memory_id: memoryId,
        item_id: item.id,
        item_title: item.title,
        list_name: item.bucket_lists?.name,
        category: item.bucket_lists?.category,
        photos: memoryData.photos,
        is_update: actionType === 'updated'
      },
      is_public: memoryData.is_public
    })
  }

  return { id: memoryId }
}

export async function deleteMemory(memoryId: string, userId: string) {
  // 1. Delete timeline events associated with this memory
  // We use the JSON containment operator to find events with metadata->memory_id matches
  const { error: timelineError } = await supabase
    .from('timeline_events')
    .delete()
    .eq('user_id', userId)
    .contains('metadata', { memory_id: memoryId })

  if (timelineError) {
    // Log but continue, as cleaning up the memory is primary
    console.error('Error deleting timeline events:', timelineError)
  }

  // 2. Delete the memory itself
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) throw error
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

  // Deduplicate: Keep only the latest memory per bucket_item_id
  const uniqueMemories = data.reduce((acc: any[], current) => {
    const isDuplicate = acc.find(item => item.bucket_item_id === current.bucket_item_id)
    if (!isDuplicate) {
      acc.push(current)
    }
    return acc
  }, [])

  return uniqueMemories
}

export async function fetchUserMemoryForItem(itemId: string, userId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('id, user_id, bucket_item_id')
    .eq('bucket_item_id', itemId)
    .eq('user_id', userId)
    .maybeSingle()

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
          name,
          category
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
  // Check if user already has a shadow copy of this list
  const { data: existingShadowCopy } = await supabase
    .from('bucket_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('origin_id', listId)
    .maybeSingle()

  // If shadow copy exists, just add follow relationship
  // If not, create shadow copy via clone
  if (!existingShadowCopy) {
    await cloneBucketList(userId, listId)
  }

  // Add follow relationship
  const { data, error } = await supabase
    .from('list_followers')
    .insert({
      user_id: userId,
      bucket_list_id: listId,
    })
    .select()
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAuditAction({
      user_id: user.id,
      action: 'follow_bucket_list',
      target_id: listId,
      target_type: 'bucket_list',
      status: error ? 'error' : 'allowed',
      metadata: { error_code: error?.code }
    })
  }

  if (error) {
    // Check if already following
    if (error.code === '23505') {
      return { already_following: true }
    }
    throw error
  }

  // Update stats and check for badges (e.g. lists_following)
  await updateProfileStats(userId)
  await checkAndAwardBadges(userId)

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

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser) {
    await logAuditAction({
      user_id: currentUser.id,
      action: 'unfollow_bucket_list',
      target_id: listId,
      target_type: 'bucket_list',
      status: 'allowed'
    })
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
      profiles!inner (username, avatar_url)
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
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data as UserProfile
}

export type UpdateProfileData = Pick<ProfileUpdate, 'username' | 'avatar_url' | 'bio' | 'twitter_url' | 'instagram_url' | 'linkedin_url' | 'github_url' | 'website_url' | 'is_private'>

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

  const updatePayload: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    // If update failed potentially due to is_private column missing
    if (error.code === '42703' && 'is_private' in updates) {
      delete updatePayload.is_private
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single()

      if (retryError) throw retryError
      return retryData as UserProfile
    }
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
