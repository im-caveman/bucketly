-- Migration: Update RLS policies for email-based admin check
-- This migration updates bucket_lists policies to check admin status via email

-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Users can insert their own bucket lists" ON public.bucket_lists;
DROP POLICY IF EXISTS "Users can update their own bucket lists" ON public.bucket_lists;

-- Policy: Users can insert their own bucket lists
-- Regular users can only create private lists (is_public = false)
-- Admin users (based on email) can create both private and public lists
CREATE POLICY "Users can insert their own bucket lists"
ON public.bucket_lists
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Regular users can only create private lists
    (is_public = false)
    OR
    -- Admin users (check email) can create public lists
    (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND email = 'tsunyoxi@gmail.com'
      )
    )
  )
);

-- Policy: Users can update their own bucket lists
-- Regular users cannot change is_public to true
-- Admin users (based on email) can change is_public freely
CREATE POLICY "Users can update their own bucket lists"
ON public.bucket_lists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- If trying to set is_public = true, must be admin (check email)
    (
      is_public = false
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND email = 'tsunyoxi@gmail.com'
      )
    )
  )
);

-- Add comments
COMMENT ON POLICY "Users can insert their own bucket lists" ON public.bucket_lists IS 
  'Users can create their own bucket lists. Only admin (tsunyoxi@gmail.com) can create public lists.';
COMMENT ON POLICY "Users can update their own bucket lists" ON public.bucket_lists IS 
  'Users can update their own bucket lists. Only admin (tsunyoxi@gmail.com) can make lists public.';
