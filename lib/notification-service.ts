import { supabase } from './supabase'
import { handleSupabaseError, logError } from './error-handler'
import type { Notification } from '@/types/dashboard'

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
      logError(error, { context: 'createAdminNotification', title })
      throw handleSupabaseError(error)
    }
  } catch (error) {
    logError(error, { context: 'createAdminNotification', title })
    throw handleSupabaseError(error)
  }
}

