/**
 * Frontend-specific types for bucket list features
 * These types extend and adapt the Supabase database types for UI components
 */

import type {
  Category as DbCategory,
  Difficulty as DbDifficulty,
  TimelineEventType as DbTimelineEventType,
  BucketItem as DbBucketItem,
  BucketList as DbBucketList,
  Profile as DbProfile,
  TimelineEvent as DbTimelineEvent,
  Memory as DbMemory,
} from './supabase'

// Re-export database types for convenience
export type Category = DbCategory
export type Difficulty = DbDifficulty
export type TimelineEventType = DbTimelineEventType

export interface BucketListWithItems {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  is_public: boolean
  follower_count: number
  created_at: string
  updated_at: string
  origin_id?: string | null
  bucket_items: BucketListItem[]
  profiles?: {
    username: string
    avatar_url: string | null
  }
  isFollowing?: boolean
}

/**
 * Frontend representation of a bucket list item
 * Extends database type with camelCase properties for UI consistency
 */
export interface BucketListItem {
  id: string
  title: string
  description: string
  points: number
  difficulty?: Difficulty
  location?: string
  completed: boolean
  completedDate?: string
  bucketListId?: string
  createdAt?: string
  updatedAt?: string
  currentValue?: number
  targetValue?: number
  unitType?: string
}

/**
 * Convert database bucket item to frontend format
 */
export function toBucketListItem(dbItem: DbBucketItem): BucketListItem {
  return {
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description || '',
    points: dbItem.points,
    difficulty: dbItem.difficulty || undefined,
    location: dbItem.location || undefined,
    completed: dbItem.completed,
    completedDate: dbItem.completed_date || undefined,
    bucketListId: dbItem.bucket_list_id,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
    currentValue: dbItem.current_value || 0,
    targetValue: dbItem.target_value || 0,
    unitType: dbItem.unit_type || undefined,
  }
}

/**
 * Frontend representation of a bucket list with items
 * Combines database types with UI-specific properties
 */
export interface BucketList {
  id: string
  name: string
  description: string
  category: Category
  items: BucketListItem[]
  isFollowing: boolean
  followers: number
  createdBy: string
  isPublic: boolean
  createdAt?: string
  updatedAt?: string
  origin_id?: string | null
}

/**
 * Convert database bucket list to frontend format
 */
export function toBucketList(
  dbList: DbBucketList,
  items: DbBucketItem[] = [],
  isFollowing = false
): BucketList {
  return {
    id: dbList.id,
    name: dbList.name,
    description: dbList.description || '',
    category: dbList.category,
    items: items.map(toBucketListItem),
    isFollowing,
    followers: dbList.follower_count,
    createdBy: dbList.user_id,
    isPublic: dbList.is_public,
    createdAt: dbList.created_at,
    updatedAt: dbList.updated_at,
    origin_id: (dbList as any).origin_id || null,
  }
}

export type UserProfile = DbProfile

/**
 * Frontend representation of a user profile
 * Adapts database profile with camelCase properties
 */
export interface UserProfileFrontend {
  id: string
  username: string
  avatar: string
  bio: string
  totalPoints: number
  globalRank: number
  itemsCompleted: number
  listsFollowing: number
  listsCreated: number
  isPrivate: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Convert database profile to frontend format
 */
export function toUserProfile(dbProfile: any): UserProfileFrontend {
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    avatar: dbProfile.avatar_url || '/placeholder-user.jpg',
    bio: dbProfile.bio || '',
    totalPoints: dbProfile.total_points,
    globalRank: dbProfile.global_rank || 0,
    itemsCompleted: dbProfile.items_completed,
    listsFollowing: dbProfile.lists_following,
    listsCreated: dbProfile.lists_created,
    isPrivate: dbProfile.is_private || false,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  }
}

/**
 * Frontend representation of a timeline event
 * Extends database type with UI-friendly property names
 */
export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string
  itemTitle?: string
  listName?: string
  photos?: string[]
  points?: number
  isPublic?: boolean
  thumbnail?: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Convert database timeline event to frontend format
 */
export function toTimelineEvent(dbEvent: DbTimelineEvent): TimelineEvent {
  const metadata = (dbEvent.metadata as Record<string, any>) || {}

  return {
    id: dbEvent.id,
    type: dbEvent.event_type,
    title: dbEvent.title,
    description: dbEvent.description || '',
    timestamp: dbEvent.created_at,
    itemTitle: metadata.item_title,
    listName: metadata.list_name,
    photos: metadata.photos,
    points: metadata.points,
    isPublic: dbEvent.is_public,
    thumbnail: metadata.thumbnail,
    userId: dbEvent.user_id,
    metadata,
  }
}

/**
 * Frontend representation of a memory
 * Combines memory data with related item information
 */
export interface Memory {
  id: string
  itemId: string
  listName: string
  itemTitle: string
  photos: string[]
  reflection: string
  points: number
  isPublic: boolean
  completedDate: string
  userId?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Convert database memory to frontend format
 */
export function toMemory(
  dbMemory: DbMemory,
  itemTitle: string,
  listName: string,
  points: number,
  completedDate: string
): Memory {
  const photos = Array.isArray(dbMemory.photos)
    ? (dbMemory.photos as string[])
    : []

  return {
    id: dbMemory.id,
    itemId: dbMemory.bucket_item_id,
    listName,
    itemTitle,
    photos,
    reflection: dbMemory.reflection,
    points,
    isPublic: dbMemory.is_public,
    completedDate,
    userId: dbMemory.user_id,
    createdAt: dbMemory.created_at,
    updatedAt: dbMemory.updated_at,
  }
}
