-- Migration: Create database functions and triggers
-- This migration creates all database functions and triggers for automated operations

-- ============================================================================
-- FUNCTION: handle_new_user
-- ============================================================================
-- Automatically create a profile when a new user signs up
-- This function is triggered on INSERT to auth.users table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up';


-- ============================================================================
-- FUNCTION: update_profile_stats
-- ============================================================================
-- Recalculates user statistics including items_completed, lists_created, and lists_following
-- This function can be called manually or by triggers to update profile statistics

CREATE OR REPLACE FUNCTION public.update_profile_stats(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    items_completed = (
      SELECT COUNT(*)
      FROM public.bucket_items bi
      JOIN public.bucket_lists bl ON bi.bucket_list_id = bl.id
      WHERE bl.user_id = user_uuid AND bi.completed = true
    ),
    lists_created = (
      SELECT COUNT(*)
      FROM public.bucket_lists
      WHERE user_id = user_uuid
    ),
    lists_following = (
      SELECT COUNT(*)
      FROM public.list_followers
      WHERE user_id = user_uuid
    ),
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;

COMMENT ON FUNCTION public.update_profile_stats(UUID) IS 'Recalculates user statistics for items completed, lists created, and lists following';


-- ============================================================================
-- FUNCTION: recalculate_global_ranks
-- ============================================================================
-- Updates global_rank for all users based on total_points using window function
-- This function should be called after points changes to maintain accurate rankings

CREATE OR REPLACE FUNCTION public.recalculate_global_ranks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ranked_users AS (
    SELECT 
      id,
      RANK() OVER (ORDER BY total_points DESC) as new_rank
    FROM public.profiles
  )
  UPDATE public.profiles p
  SET global_rank = ru.new_rank
  FROM ranked_users ru
  WHERE p.id = ru.id;
END;
$$;

COMMENT ON FUNCTION public.recalculate_global_ranks() IS 'Updates global rank for all users based on total points';


-- ============================================================================
-- FUNCTION: increment_follower_count
-- ============================================================================
-- Increments the follower_count when a user follows a bucket list
-- This function is triggered on INSERT to list_followers table

CREATE OR REPLACE FUNCTION public.increment_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bucket_lists
  SET follower_count = follower_count + 1
  WHERE id = NEW.bucket_list_id;
  RETURN NEW;
END;
$$;

-- Create trigger for incrementing follower count
DROP TRIGGER IF EXISTS on_list_followed ON public.list_followers;
CREATE TRIGGER on_list_followed
  AFTER INSERT ON public.list_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_follower_count();

COMMENT ON FUNCTION public.increment_follower_count() IS 'Increments follower count when a user follows a bucket list';

-- ============================================================================
-- FUNCTION: decrement_follower_count
-- ============================================================================
-- Decrements the follower_count when a user unfollows a bucket list
-- This function is triggered on DELETE from list_followers table

CREATE OR REPLACE FUNCTION public.decrement_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bucket_lists
  SET follower_count = follower_count - 1
  WHERE id = OLD.bucket_list_id;
  RETURN OLD;
END;
$$;

-- Create trigger for decrementing follower count
DROP TRIGGER IF EXISTS on_list_unfollowed ON public.list_followers;
CREATE TRIGGER on_list_unfollowed
  AFTER DELETE ON public.list_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_follower_count();

COMMENT ON FUNCTION public.decrement_follower_count() IS 'Decrements follower count when a user unfollows a bucket list';


-- ============================================================================
-- FUNCTION: handle_item_completion
-- ============================================================================
-- Handles bucket item completion by:
-- 1. Updating user's total points
-- 2. Incrementing items_completed counter
-- 3. Creating a timeline event
-- 4. Setting the completed_date timestamp
-- This function is triggered on UPDATE to bucket_items table

CREATE OR REPLACE FUNCTION public.handle_item_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  list_owner_id UUID;
  item_points INTEGER;
BEGIN
  -- Only process when item is being marked as completed
  IF NEW.completed = true AND OLD.completed = false THEN
    -- Get the list owner and item points
    SELECT bl.user_id, NEW.points
    INTO list_owner_id, item_points
    FROM public.bucket_lists bl
    WHERE bl.id = NEW.bucket_list_id;
    
    -- Update user's total points and items_completed counter
    UPDATE public.profiles
    SET 
      total_points = total_points + item_points,
      items_completed = items_completed + 1,
      updated_at = NOW()
    WHERE id = list_owner_id;
    
    -- Create timeline event for item completion
    INSERT INTO public.timeline_events (
      user_id, event_type, title, description, metadata
    ) VALUES (
      list_owner_id,
      'item_completed',
      'Completed: ' || NEW.title,
      'Earned ' || item_points || ' points',
      jsonb_build_object(
        'item_id', NEW.id,
        'points', item_points,
        'list_id', NEW.bucket_list_id
      )
    );
    
    -- Set completion date
    NEW.completed_date = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for item completion
DROP TRIGGER IF EXISTS on_item_completed ON public.bucket_items;
CREATE TRIGGER on_item_completed
  BEFORE UPDATE ON public.bucket_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_item_completion();

COMMENT ON FUNCTION public.handle_item_completion() IS 'Handles item completion by updating points, creating timeline event, and setting completion date';

