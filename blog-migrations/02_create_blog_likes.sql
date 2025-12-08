-- Create blog_likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a user can only like a post once
    CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id)
);

-- Create index on post_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON public.blog_likes(post_id);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view like counts
CREATE POLICY "Anyone can view blog likes"
    ON public.blog_likes
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can like posts
CREATE POLICY "Authenticated users can like blog posts"
    ON public.blog_likes
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- Policy: Users can unlike their own likes
CREATE POLICY "Users can delete their own blog likes"
    ON public.blog_likes
    FOR DELETE
    TO authenticated
    USING ((auth.jwt() ->> 'sub') = user_id);

-- Grant permissions
GRANT SELECT ON public.blog_likes TO anon;
GRANT ALL ON public.blog_likes TO authenticated;
