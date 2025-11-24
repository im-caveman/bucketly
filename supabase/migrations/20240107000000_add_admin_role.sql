-- Migration: Add admin role functionality
-- This migration adds admin capabilities to the profiles table and updates RLS policies

-- ============================================================================
-- ADD ADMIN FIELDS TO PROFILES TABLE
-- ============================================================================

-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Add email column to profiles table for admin identification
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on is_admin for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Add comment
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';
COMMENT ON COLUMN public.profiles.email IS 'User email address for admin identification';

-- ============================================================================
-- SET ADMIN USER
-- ============================================================================

-- Set the admin user (tsunyoxi@gmail.com)
-- This will be set via a trigger when the user signs up or can be set manually
-- For now, we'll create a function to set admin status based on email

CREATE OR REPLACE FUNCTION public.set_admin_if_email_matches()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches the admin email
  IF NEW.email = 'tsunyoxi@gmail.com' THEN
    NEW.is_admin := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin status on profile creation/update
DROP TRIGGER IF EXISTS set_admin_on_profile_change ON public.profiles;
CREATE TRIGGER set_admin_on_profile_change
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_if_email_matches();

-- ============================================================================
-- UPDATE RLS POLICIES FOR BUCKET_LISTS
-- ============================================================================

-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Users can insert their own bucket lists" ON public.bucket_lists;
DROP POLICY IF EXISTS "Users can update their own bucket lists" ON public.bucket_lists;

-- Policy: Users can insert their own bucket lists
-- Regular users can only create private lists (is_public = false)
-- Admin users can create both private and public lists
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
    -- Admin users can create public lists
    (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND is_admin = true
      )
    )
  )
);

-- Policy: Users can update their own bucket lists
-- Regular users cannot change is_public to true
-- Admin users can change is_public freely
CREATE POLICY "Users can update their own bucket lists"
ON public.bucket_lists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- If trying to set is_public = true, must be admin
    (
      is_public = false
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND is_admin = true
      )
    )
  )
);

-- Add comment
COMMENT ON POLICY "Users can insert their own bucket lists" ON public.bucket_lists IS 
  'Users can create their own bucket lists. Only admins can create public lists.';
COMMENT ON POLICY "Users can update their own bucket lists" ON public.bucket_lists IS 
  'Users can update their own bucket lists. Only admins can make lists public.';
