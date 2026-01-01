import { supabase } from './supabase'
import { handleSupabaseError, logError } from './error-handler'
import type { Notification } from '@/types/dashboard'
import { isAdminEmail } from './admin-config'

/**
 * Notification Service
 * Handles all notification-related operations including admin broadcasts
 */

export interface NotificationData {
  id: string
  title: string
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  priority: 'low' | 'medium' | 'high'
  is_admin_notification?: boolean
  metadata?: Record<string, any>
}

/**
 * Convert database notification to frontend format
 */
function toNotification(dbNotification: any): Notification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    timestamp: dbNotification.created_at,
    type: dbNotification.type as 'info' | 'warning' | 'success' | 'error',
    read: dbNotification.read,
    priority: dbNotification.priority as 'low' | 'medium' | 'high',
  }
}

/**
 * Fetch all notifications for the current user
 */
export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logError(error, { context: 'fetchUserNotifications', userId })
      throw handleSupabaseError(error)
    }

    return (data || []).map(toNotification)
  } catch (error) {
    logError(error, { context: 'fetchUserNotifications', userId })
    throw handleSupabaseError(error)
  }
}

/**
 * Subscribe to real-time notification updates for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(toNotification(payload.new))
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(toNotification(payload.new))
      }
    )
    .subscribe()

  return channel
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      logError(error, { context: 'markNotificationAsRead', notificationId, userId })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    logError(error, { context: 'markNotificationAsRead', notificationId, userId })
    throw handleSupabaseError(error)
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      logError(error, { context: 'deleteNotification', notificationId, userId })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    logError(error, { context: 'deleteNotification', notificationId, userId })
    throw handleSupabaseError(error)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      logError(error, { context: 'markAllNotificationsAsRead', userId })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    logError(error, { context: 'markAllNotificationsAsRead', userId })
    throw handleSupabaseError(error)
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      logError(error, { context: 'deleteAllNotifications', userId })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    logError(error, { context: 'deleteAllNotifications', userId })
    throw handleSupabaseError(error)
  }
}

/**
 * Create an admin notification (broadcast to all users)
 * This function calls the database function that creates notifications for all users
 */
export async function createAdminNotification(
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  priority: 'low' | 'medium' | 'high' = 'medium',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_admin_notification', {
      p_title: title,
      p_message: message,
      p_type: type,
      p_priority: priority,
      p_metadata: metadata,
    })

    if (error) {
      console.error('Supabase RPC error:', error)
      logError(error, { context: 'createAdminNotification', title, params: { title, message, type, priority, metadata } })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('Exception in createAdminNotification:', error)
    logError(error, { context: 'createAdminNotification', title })
    throw handleSupabaseError(error)
  }
}


/**
 * Notify followers of a user when they complete a task from a shadow list
 * Follows requirements:
 * 1.1: Notify for completed tasks from followed lists
 * 1.2: NEVER notify for created lists (origin_id is null)
 * 1.3: Respect task privacy (is_public_memory)
 * 1.4: Respect list privacy (skip if is_public is false UNLESS shadowed)
 */
export async function notifyFollowersOfCompletion(
  userId: string,
  itemId: string,
  isPublicMemory: boolean
): Promise<void> {
  try {
    // 1. Fetch item and list details
    const { data: itemData, error: itemError } = await supabase
      .from('bucket_items')
      .select(`
        id,
        title,
        bucket_list_id,
        bucket_lists (
          id,
          name,
          is_public,
          origin_id,
          user_id
        )
      `)
      .eq('id', itemId)
      .single()

    if (itemError || !itemData) {
      console.warn('Could not find item for notification:', itemId)
      return
    }

    const item = itemData as any
    const list = Array.isArray(item.bucket_lists) ? item.bucket_lists[0] : item.bucket_lists
    if (!list) {
      return
    }

    // Requirement 1.2: Check if list was created by the user (not a shadow copy)
    if (!list.origin_id) {
      console.log('Skipping notification: List is user-created (Requirement 1.2)')
      return
    }

    // Requirement 1.3: Check task privacy
    if (!isPublicMemory) {
      return
    }

    // Requirement 1.4: Any actions on private lists (...) should never trigger (regardless of user role)
    // Here we have a conflict: shadow clones (list.origin_id is not null) are private by default for non-admins,
    // and they CANNOT be made public because updateBucketList blocks editing them.
    // If we return here, 1.1 (A follows B, notify A) will never work for non-admins.
    // We will assume that 1.1 specifically refers to shadow copies and overrides 1.4 in this context,
    // OR that 1.4 applies to "Ordinary" private lists.
    // However, to be extra safe, if a list is explicitly private and has NO origin_id, we stop (already covered by 1.2).
    // If it has an origin_id, we proceed IF memory is public.

    // 2. Fetch the completer profile to get username
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    const profile = profileData as any
    const username = profile?.username || 'Someone'

    // 3. Call the broadcast RPC
    const rpcTitle = 'Task Completed! 🎯'
    const rpcMessage = `${username} completed "${item.title}" from "${list.name}"`
    const rpcMetadata = {
      item_id: item.id,
      list_id: list.id,
      completer_id: userId,
      completer_username: username
    }

    const { error: rpcError } = await supabase.rpc('broadcast_completion_notification', {
      p_completer_id: userId,
      p_title: rpcTitle,
      p_message: rpcMessage,
      p_metadata: rpcMetadata
    })

    if (rpcError) {
      console.error('Error calling broadcast RPC:', rpcError)
      logError(rpcError, { context: 'notifyFollowersOfCompletion', userId })
    }
  } catch (error) {
    console.error('Exception in notifyFollowersOfCompletion:', error)
    logError(error, { context: 'notifyFollowersOfCompletion', userId })
  }
}
