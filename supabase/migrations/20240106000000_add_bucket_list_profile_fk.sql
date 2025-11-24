-- Migration: Add foreign key relationship between bucket_lists and profiles
-- This allows PostgREST to detect the relationship for joins

ALTER TABLE public.bucket_lists
DROP CONSTRAINT IF EXISTS bucket_lists_user_id_fkey;

-- Re-add the constraint pointing to profiles instead of auth.users
-- Since profiles.id is a foreign key to auth.users.id and is the PK of profiles,
-- this maintains the link to the user while allowing joins with profiles table.
ALTER TABLE public.bucket_lists
ADD CONSTRAINT bucket_lists_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
