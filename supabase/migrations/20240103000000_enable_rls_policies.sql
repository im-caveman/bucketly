-- Migration: Enable Row Level Security and create policies for all tables
-- This migration implements RLS policies to enforce data access permissions at the database level

-- ============================================================================
-- PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone (authenticated and anonymous) to view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

COMMENT ON POLICY "Profiles are viewable by everyone" ON public.profiles IS 'Allows all users to view profile information';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Restricts profile updates to the profile owner only';


-- ============================================================================
-- BUCKET_LISTS TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on bucket_lists table
ALTER TABLE public.bucket_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Allow viewing public lists or lists owned by the user
CREATE POLICY "Public lists and owned lists are viewable"
  ON public.bucket_lists
  FOR SELECT
  TO authenticated, anon
  USING (is_public = true OR (SELECT auth.uid()) = user_id);

-- Policy: Allow authenticated users to create their own lists
CREATE POLICY "Users can create own lists"
  ON public.bucket_lists
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to update only their own lists
CREATE POLICY "Users can update own lists"
  ON public.bucket_lists
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to delete only their own lists
CREATE POLICY "Users can delete own lists"
  ON public.bucket_lists
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Public lists and owned lists are viewable" ON public.bucket_lists IS 'Allows viewing public lists or lists owned by the authenticated user';
COMMENT ON POLICY "Users can create own lists" ON public.bucket_lists IS 'Allows authenticated users to create bucket lists';
COMMENT ON POLICY "Users can update own lists" ON public.bucket_lists IS 'Restricts list updates to the list owner';
COMMENT ON POLICY "Users can delete own lists" ON public.bucket_lists IS 'Restricts list deletion to the list owner';


-- ============================================================================
-- BUCKET_ITEMS TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on bucket_items table
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow viewing items if the parent list is accessible
CREATE POLICY "Items viewable if list is accessible"
  ON public.bucket_items
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.bucket_lists bl
      WHERE bl.id = bucket_list_id
      AND (bl.is_public = true OR bl.user_id = (SELECT auth.uid()))
    )
  );

-- Policy: Allow users to add items to their own lists
CREATE POLICY "Users can add items to own lists"
  ON public.bucket_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bucket_lists bl
      WHERE bl.id = bucket_list_id
      AND bl.user_id = (SELECT auth.uid())
    )
  );

-- Policy: Allow users to update items in their own lists
CREATE POLICY "Users can update items in own lists"
  ON public.bucket_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bucket_lists bl
      WHERE bl.id = bucket_list_id
      AND bl.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bucket_lists bl
      WHERE bl.id = bucket_list_id
      AND bl.user_id = (SELECT auth.uid())
    )
  );

-- Policy: Allow users to delete items from their own lists
CREATE POLICY "Users can delete items from own lists"
  ON public.bucket_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bucket_lists bl
      WHERE bl.id = bucket_list_id
      AND bl.user_id = (SELECT auth.uid())
    )
  );

COMMENT ON POLICY "Items viewable if list is accessible" ON public.bucket_items IS 'Allows viewing items if the parent list is public or owned by the user';
COMMENT ON POLICY "Users can add items to own lists" ON public.bucket_items IS 'Allows users to add items only to their own lists';
COMMENT ON POLICY "Users can update items in own lists" ON public.bucket_items IS 'Allows users to update items only in their own lists';
COMMENT ON POLICY "Users can delete items from own lists" ON public.bucket_items IS 'Allows users to delete items only from their own lists';


-- ============================================================================
-- MEMORIES TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on memories table
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow viewing public memories or memories owned by the user
CREATE POLICY "Memories viewable based on privacy"
  ON public.memories
  FOR SELECT
  TO authenticated, anon
  USING (is_public = true OR (SELECT auth.uid()) = user_id);

-- Policy: Allow users to create their own memories
CREATE POLICY "Users can create own memories"
  ON public.memories
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to update only their own memories
CREATE POLICY "Users can update own memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to delete only their own memories
CREATE POLICY "Users can delete own memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Memories viewable based on privacy" ON public.memories IS 'Allows viewing public memories or memories owned by the authenticated user';
COMMENT ON POLICY "Users can create own memories" ON public.memories IS 'Allows authenticated users to create memories';
COMMENT ON POLICY "Users can update own memories" ON public.memories IS 'Restricts memory updates to the memory owner';
COMMENT ON POLICY "Users can delete own memories" ON public.memories IS 'Restricts memory deletion to the memory owner';


-- ============================================================================
-- LIST_FOLLOWERS TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on list_followers table
ALTER TABLE public.list_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own follows
CREATE POLICY "Users can view own follows"
  ON public.list_followers
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to follow lists (create follow relationships)
CREATE POLICY "Users can follow lists"
  ON public.list_followers
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to unfollow lists (delete follow relationships)
CREATE POLICY "Users can unfollow lists"
  ON public.list_followers
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Users can view own follows" ON public.list_followers IS 'Allows users to view their own follow relationships';
COMMENT ON POLICY "Users can follow lists" ON public.list_followers IS 'Allows authenticated users to follow bucket lists';
COMMENT ON POLICY "Users can unfollow lists" ON public.list_followers IS 'Allows users to unfollow bucket lists they are following';


-- ============================================================================
-- TIMELINE_EVENTS TABLE RLS POLICIES
-- ============================================================================

-- Enable Row Level Security on timeline_events table
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow viewing public events or events owned by the user
CREATE POLICY "Timeline events viewable based on privacy"
  ON public.timeline_events
  FOR SELECT
  TO authenticated, anon
  USING (is_public = true OR (SELECT auth.uid()) = user_id);

-- Policy: Allow users to create their own timeline events
CREATE POLICY "Users can create own events"
  ON public.timeline_events
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to update only their own timeline events
CREATE POLICY "Users can update own events"
  ON public.timeline_events
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to delete only their own timeline events
CREATE POLICY "Users can delete own events"
  ON public.timeline_events
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Timeline events viewable based on privacy" ON public.timeline_events IS 'Allows viewing public events or events owned by the authenticated user';
COMMENT ON POLICY "Users can create own events" ON public.timeline_events IS 'Allows authenticated users to create timeline events';
COMMENT ON POLICY "Users can update own events" ON public.timeline_events IS 'Restricts event updates to the event owner';
COMMENT ON POLICY "Users can delete own events" ON public.timeline_events IS 'Restricts event deletion to the event owner';
