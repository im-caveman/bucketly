-- Migration: Update user_follows foreign keys to reference profiles
-- This allows joining user_follows with profiles to fetch user data

-- Drop existing foreign keys
ALTER TABLE public.user_follows
DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey,
DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey;

-- Add new foreign keys referencing profiles
ALTER TABLE public.user_follows
ADD CONSTRAINT user_follows_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_follows
ADD CONSTRAINT user_follows_following_id_fkey 
FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Comment to explain the relationship
COMMENT ON CONSTRAINT user_follows_follower_id_fkey ON public.user_follows IS 'References the profile of the follower';
COMMENT ON CONSTRAINT user_follows_following_id_fkey ON public.user_follows IS 'References the profile of the user being followed';
