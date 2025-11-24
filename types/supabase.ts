/**
 * Supabase Database Type Definitions
 * 
 * To regenerate these types from your Supabase project, run:
 * npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
 * 
 * Or if using the Supabase CLI with a linked project:
 * npx supabase gen types typescript --linked > types/supabase.ts
 * 
 * These types are based on the database schema defined in:
 * - supabase/migrations/20240101000000_create_core_tables.sql
 * - supabase/migrations/20240102000000_create_functions_and_triggers.sql
 * - supabase/migrations/20240103000000_enable_rls_policies.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Category =
  | 'adventures'
  | 'places'
  | 'cuisines'
  | 'books'
  | 'songs'
  | 'monuments'
  | 'acts-of-service'
  | 'miscellaneous'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type TimelineEventType =
  | 'item_completed'
  | 'memory_uploaded'
  | 'memory_shared'
  | 'list_created'
  | 'list_followed'
  | 'achievement_unlocked'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string | null
          avatar_url: string | null
          bio: string | null
          is_admin: boolean
          total_points: number
          global_rank: number | null
          items_completed: number
          lists_following: number
          lists_created: number
          followers_count: number
          following_count: number
          twitter_url: string | null
          instagram_url: string | null
          linkedin_url: string | null
          github_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean
          total_points?: number
          global_rank?: number | null
          items_completed?: number
          lists_following?: number
          lists_created?: number
          followers_count?: number
          following_count?: number
          twitter_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean
          total_points?: number
          global_rank?: number | null
          items_completed?: number
          lists_following?: number
          lists_created?: number
          followers_count?: number
          following_count?: number
          twitter_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bucket_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: Category
          is_public: boolean
          follower_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: Category
          is_public?: boolean
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: Category
          is_public?: boolean
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bucket_lists_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      bucket_items: {
        Row: {
          id: string
          bucket_list_id: string
          title: string
          description: string | null
          points: number
          difficulty: Difficulty | null
          location: string | null
          completed: boolean
          completed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bucket_list_id: string
          title: string
          description?: string | null
          points?: number
          difficulty?: Difficulty | null
          location?: string | null
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bucket_list_id?: string
          title?: string
          description?: string | null
          points?: number
          difficulty?: Difficulty | null
          location?: string | null
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bucket_items_bucket_list_id_fkey'
            columns: ['bucket_list_id']
            referencedRelation: 'bucket_lists'
            referencedColumns: ['id']
          }
        ]
      }
      memories: {
        Row: {
          id: string
          user_id: string
          bucket_item_id: string
          reflection: string
          photos: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bucket_item_id: string
          reflection: string
          photos?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bucket_item_id?: string
          reflection?: string
          photos?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'memories_bucket_item_id_fkey'
            columns: ['bucket_item_id']
            referencedRelation: 'bucket_items'
            referencedColumns: ['id']
          }
        ]
      }
      list_followers: {
        Row: {
          id: string
          user_id: string
          bucket_list_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bucket_list_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bucket_list_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'list_followers_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'list_followers_bucket_list_id_fkey'
            columns: ['bucket_list_id']
            referencedRelation: 'bucket_lists'
            referencedColumns: ['id']
          }
        ]
      }
      timeline_events: {
        Row: {
          id: string
          user_id: string
          event_type: TimelineEventType
          title: string
          description: string | null
          metadata: Json
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: TimelineEventType
          title: string
          description?: string | null
          metadata?: Json
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: TimelineEventType
          title?: string
          description?: string | null
          metadata?: Json
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timeline_events_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_follows_follower_id_fkey'
            columns: ['follower_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_follows_following_id_fkey'
            columns: ['following_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          total_points: number
          global_rank: number | null
          items_completed: number
          current_rank: number
        }
        Relationships: []
      }
      user_feed_view: {
        Row: {
          id: string
          user_id: string
          event_type: TimelineEventType
          title: string
          description: string | null
          metadata: Json
          created_at: string
          username: string
          avatar_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_profile_stats: {
        Args: { user_uuid: string }
        Returns: void
      }
      recalculate_global_ranks: {
        Args: Record<string, never>
        Returns: void
      }
      increment_follower_count: {
        Args: Record<string, never>
        Returns: void
      }
      decrement_follower_count: {
        Args: Record<string, never>
        Returns: void
      }
      handle_item_completion: {
        Args: Record<string, never>
        Returns: void
      }
      handle_new_user: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      category: Category
      difficulty: Difficulty
      timeline_event_type: TimelineEventType
    }
  }
}

// Helper types for easier access to table types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table type exports for convenience
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type UserFollow = Tables<'user_follows'>
export type UserFollowInsert = TablesInsert<'user_follows'>
export type UserFollowUpdate = TablesUpdate<'user_follows'>

export type BucketList = Tables<'bucket_lists'>
export type BucketListInsert = TablesInsert<'bucket_lists'>
export type BucketListUpdate = TablesUpdate<'bucket_lists'>

export type BucketItem = Tables<'bucket_items'>
export type BucketItemInsert = TablesInsert<'bucket_items'>
export type BucketItemUpdate = TablesUpdate<'bucket_items'>

export type Memory = Tables<'memories'>
export type MemoryInsert = TablesInsert<'memories'>
export type MemoryUpdate = TablesUpdate<'memories'>

export type ListFollower = Tables<'list_followers'>
export type ListFollowerInsert = TablesInsert<'list_followers'>
export type ListFollowerUpdate = TablesUpdate<'list_followers'>

export type TimelineEvent = Tables<'timeline_events'>
export type TimelineEventInsert = TablesInsert<'timeline_events'>
export type TimelineEventUpdate = TablesUpdate<'timeline_events'>

// View types
export type LeaderboardEntry = Database['public']['Views']['leaderboard_view']['Row']
export type UserFeedEvent = Database['public']['Views']['user_feed_view']['Row']
