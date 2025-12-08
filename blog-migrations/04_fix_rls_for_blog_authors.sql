-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone for blog posts" ON public.profiles;

-- Create a simple policy to allow anyone to read profiles
-- This is safe because profiles are meant to be public information
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);
