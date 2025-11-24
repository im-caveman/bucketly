-- Migration: Create core database tables for bucket list application
-- This migration creates all core tables with constraints, indexes, and relationships

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Create profiles table to extend auth.users with application-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  total_points INTEGER DEFAULT 0 NOT NULL,
  global_rank INTEGER,
  items_completed INTEGER DEFAULT 0 NOT NULL,
  lists_following INTEGER DEFAULT 0 NOT NULL,
  lists_created INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 500),
  CONSTRAINT total_points_non_negative CHECK (total_points >= 0),
  CONSTRAINT items_completed_non_negative CHECK (items_completed >= 0),
  CONSTRAINT lists_following_non_negative CHECK (lists_following >= 0),
  CONSTRAINT lists_created_non_negative CHECK (lists_created >= 0)
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_global_rank ON public.profiles(global_rank);

-- Add comment
COMMENT ON TABLE public.profiles IS 'User profiles with statistics and preferences';

-- ============================================================================
-- BUCKET_LISTS TABLE
-- ============================================================================
-- Create bucket_lists table for organizing bucket list items
CREATE TABLE IF NOT EXISTS public.bucket_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  follower_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  CONSTRAINT valid_category CHECK (category IN (
    'adventures', 'places', 'cuisines', 'books', 
    'songs', 'monuments', 'acts-of-service', 'miscellaneous'
  )),
  CONSTRAINT follower_count_non_negative CHECK (follower_count >= 0)
);

-- Create indexes for bucket_lists table
CREATE INDEX IF NOT EXISTS idx_bucket_lists_user_id ON public.bucket_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_lists_category ON public.bucket_lists(category);
CREATE INDEX IF NOT EXISTS idx_bucket_lists_is_public ON public.bucket_lists(is_public);
CREATE INDEX IF NOT EXISTS idx_bucket_lists_created_at ON public.bucket_lists(created_at DESC);

-- Add comment
COMMENT ON TABLE public.bucket_lists IS 'Collections of bucket list items organized by category';

-- ============================================================================
-- BUCKET_ITEMS TABLE
-- ============================================================================
-- Create bucket_items table for individual goals/tasks
CREATE TABLE IF NOT EXISTS public.bucket_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_list_id UUID NOT NULL REFERENCES public.bucket_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 50,
  difficulty TEXT,
  location TEXT,
  completed BOOLEAN DEFAULT false NOT NULL,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  CONSTRAINT points_range CHECK (points >= 1 AND points <= 1000),
  CONSTRAINT valid_difficulty CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT completed_date_when_completed CHECK (
    (completed = false AND completed_date IS NULL) OR
    (completed = true)
  )
);

-- Create indexes for bucket_items table
CREATE INDEX IF NOT EXISTS idx_bucket_items_list_id ON public.bucket_items(bucket_list_id);
CREATE INDEX IF NOT EXISTS idx_bucket_items_completed ON public.bucket_items(completed);
CREATE INDEX IF NOT EXISTS idx_bucket_items_created_at ON public.bucket_items(created_at DESC);

-- Add comment
COMMENT ON TABLE public.bucket_items IS 'Individual goals or tasks within bucket lists';

-- ============================================================================
-- MEMORIES TABLE
-- ============================================================================
-- Create memories table for documenting completed items
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_item_id UUID NOT NULL REFERENCES public.bucket_items(id) ON DELETE CASCADE,
  reflection TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT reflection_length CHECK (char_length(reflection) >= 10 AND char_length(reflection) <= 5000)
);

-- Create indexes for memories table
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_item_id ON public.memories(bucket_item_id);
CREATE INDEX IF NOT EXISTS idx_memories_is_public ON public.memories(is_public);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON public.memories(created_at DESC);

-- Add comment
COMMENT ON TABLE public.memories IS 'User memories documenting completed bucket list items';

-- ============================================================================
-- LIST_FOLLOWERS TABLE
-- ============================================================================
-- Create list_followers table for social following relationships
CREATE TABLE IF NOT EXISTS public.list_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_list_id UUID NOT NULL REFERENCES public.bucket_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_user_list_follow UNIQUE(user_id, bucket_list_id)
);

-- Create indexes for list_followers table
CREATE INDEX IF NOT EXISTS idx_list_followers_user_id ON public.list_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_list_followers_list_id ON public.list_followers(bucket_list_id);
CREATE INDEX IF NOT EXISTS idx_list_followers_created_at ON public.list_followers(created_at DESC);

-- Add comment
COMMENT ON TABLE public.list_followers IS 'Tracks which users follow which bucket lists';

-- ============================================================================
-- TIMELINE_EVENTS TABLE
-- ============================================================================
-- Create timeline_events table for activity tracking
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'item_completed', 'memory_uploaded', 'memory_shared',
    'list_created', 'list_followed', 'achievement_unlocked'
  ))
);

-- Create indexes for timeline_events table
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON public.timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_created_at ON public.timeline_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_is_public ON public.timeline_events(is_public);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_created ON public.timeline_events(user_id, created_at DESC);

-- Add comment
COMMENT ON TABLE public.timeline_events IS 'Chronological record of user activities and achievements';
