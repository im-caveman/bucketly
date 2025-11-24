-- Migration: Add user follow system
-- This migration creates tables and triggers for following users and sending notifications

-- ============================================================================
-- USER_FOLLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_user_follow UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create indexes for user_follows table
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at DESC);

COMMENT ON TABLE public.user_follows IS 'Tracks which users follow which users';

-- ============================================================================
-- ADD FOLLOWER COUNTS TO PROFILES
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.profiles
ADD CONSTRAINT followers_count_non_negative CHECK (followers_count >= 0),
ADD CONSTRAINT following_count_non_negative CHECK (following_count >= 0);

COMMENT ON COLUMN public.profiles.followers_count IS 'Number of users following this user';
COMMENT ON COLUMN public.profiles.following_count IS 'Number of users this user is following';

-- ============================================================================
-- FUNCTION: Update follower counts
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    -- Increment followers count for user being followed
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
    -- Create notification for the user being followed
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata
    ) VALUES (
      NEW.following_id,
      'new_follower',
      'New Follower',
      (SELECT username FROM public.profiles WHERE id = NEW.follower_id) || ' started following you',
      jsonb_build_object(
        'follower_id', NEW.follower_id,
        'follower_username', (SELECT username FROM public.profiles WHERE id = NEW.follower_id)
      )
    );
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    
    -- Decrement followers count for user being unfollowed
    UPDATE public.profiles
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Update follower counts on follow/unfollow
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_user_follower_counts ON public.user_follows;
CREATE TRIGGER trigger_update_user_follower_counts
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_follower_counts();

-- ============================================================================
-- FUNCTION: Notify followers on item completion
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_followers_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  item_title TEXT;
  user_name TEXT;
  list_name TEXT;
BEGIN
  -- Only proceed if item was just marked as completed and memory is public
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    -- Get item details
    SELECT bi.title, bl.name, p.username
    INTO item_title, list_name, user_name
    FROM public.bucket_items bi
    JOIN public.bucket_lists bl ON bi.bucket_list_id = bl.id
    JOIN public.profiles p ON bl.user_id = p.id
    WHERE bi.id = NEW.id;
    
    -- Create notifications for all followers
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata
    )
    SELECT 
      uf.follower_id,
      'follower_completion',
      user_name || ' completed an item',
      user_name || ' completed "' || item_title || '" from ' || list_name,
      jsonb_build_object(
        'user_id', (SELECT user_id FROM public.bucket_lists WHERE id = NEW.bucket_list_id),
        'username', user_name,
        'item_id', NEW.id,
        'item_title', item_title,
        'list_name', list_name
      )
    FROM public.user_follows uf
    WHERE uf.following_id = (SELECT user_id FROM public.bucket_lists WHERE id = NEW.bucket_list_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Notify followers when user completes item
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_notify_followers_on_completion ON public.bucket_items;
CREATE TRIGGER trigger_notify_followers_on_completion
  AFTER UPDATE ON public.bucket_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_on_completion();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all follows
CREATE POLICY "Users can view all follows"
  ON public.user_follows
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can follow others
CREATE POLICY "Users can follow others"
  ON public.user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.user_follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);
