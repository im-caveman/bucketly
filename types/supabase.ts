/**
 * Supabase Database Types
 * 
 * This file contains TypeScript type definitions for Supabase database tables.
 * In production, these should be generated using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bucket_lists: {
        Row: BucketList
        Insert: BucketList
        Update: Partial<BucketList>
      }
      bucket_items: {
        Row: BucketItem
        Insert: BucketItem
        Update: Partial<BucketItem>
      }
      memories: {
        Row: Memory
        Insert: Memory
        Update: Partial<Memory>
      }
      notifications: {
        Row: Notification
        Insert: Notification
        Update: Partial<Notification>
      }
      timeline_events: {
        Row: TimelineEvent
        Insert: TimelineEvent
        Update: Partial<TimelineEvent>
      }
      users: {
        Row: User
        Insert: User
        Update: Partial<User>
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
      blog_posts: {
        Row: BlogPost
        Insert: BlogPost
        Update: Partial<BlogPost>
      }
      list_followers: {
        Row: ListFollower
        Insert: ListFollower
        Update: Partial<ListFollower>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category: Category
    }
  }
}

export interface BucketList {
  id: string
  user_id: string
  name: string
  description: string | null
  category: Category
  is_public: boolean
  follower_count: number
  origin_id: string | null
  created_at: string
  updated_at: string
}

export interface BucketItem {
  id: string
  bucket_list_id: string
  title: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  is_completed: boolean
  completed_date: string | null
  completedDate?: string | null
  created_at: string
  updated_at: string
  location: string | null
  target_value: number | null
  unit_type: string | null
  current_value: number | null
}

export interface Memory {
  id: string
  bucket_item_id: string
  user_id: string
  reflection: string
  photos: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  user_id: string
  event_type: 'item_completed' | 'memory_uploaded' | 'memory_shared' | 'list_created' | 'list_followed' | 'achievement_unlocked'
  title: string
  description: string | null
  metadata: Json
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  is_admin?: boolean
}

export interface Profile {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  bio: string | null
  twitter_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  points: number
  rank: number | null
  global_rank: number | null
  total_points: number | null
  items_completed: number | null
  lists_following: number | null
  lists_created: number | null
  followers_count: number | null
  following_count: number | null
  is_private: boolean | null
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  category: 'guide' | 'challenge' | 'inspiration' | 'how-to'
  tags: string[]
  author_id: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  view_count: number
  reading_time_minutes: number
  meta_title: string | null
  meta_description: string | null
  is_featured: boolean
}

export type Category =
  | 'adventures'
  | 'places'
  | 'cuisines'
  | 'books'
  | 'songs'
  | 'movies'
  | 'fitness'
  | 'skills'
  | 'experiences'
  | 'goals'
  | 'travel'
  | 'hobbies'
  | 'other'
  | 'miscellaneous'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type TimelineEventType = 'item_completed' | 'memory_uploaded' | 'memory_shared' | 'list_created' | 'list_followed' | 'achievement_unlocked'

export type BlogPostWithAuthor = BlogPost & {
  author: {
    username: string
    avatar_url: string | null
  }
}

export type BucketListInsert = Omit<BucketList, 'id' | 'created_at' | 'updated_at'>
export type BucketListUpdate = Partial<BucketList>
export type BucketItemInsert = Omit<BucketItem, 'id' | 'created_at' | 'updated_at'>
export type BucketItemUpdate = Partial<BucketItem>
export type MemoryInsert = Omit<Memory, 'id' | 'created_at' | 'updated_at'>
export type MemoryUpdate = Partial<Memory>
export type TimelineEventInsert = Omit<TimelineEvent, 'id' | 'created_at'>
export type ProfileUpdate = Partial<Profile>

export interface ListFollower {
  id: string
  user_id: string
  bucket_list_id: string
  created_at: string
}

export type ListFollowerInsert = Omit<ListFollower, 'id' | 'created_at'>

export interface GlobalItem {
  id: string
  title: string
  description: string | null
  category: Category
  difficulty: Difficulty | null
  points: number
  target_value: number | null
  unit_type: string | null
  current_value: number | null
  location: string | null
  created_at: string
  updated_at: string
}
