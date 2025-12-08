-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('guide', 'challenge', 'inspiration', 'how-to')),
    tags TEXT[] DEFAULT '{}',
    author_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count INTEGER NOT NULL DEFAULT 0,
    reading_time_minutes INTEGER NOT NULL DEFAULT 1,
    meta_title TEXT,
    meta_description TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT excerpt_length CHECK (char_length(excerpt) <= 160)
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Create index on published_at for sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Create index on tags for filtering (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN(tags);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON public.blog_posts 
USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_posts_updated_at();

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Published blog posts are viewable by everyone"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published');

-- Policy: Authenticated users can view all posts (for admin panel)
CREATE POLICY "Authenticated users can view all blog posts"
    ON public.blog_posts
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only admins can insert posts
CREATE POLICY "Only admins can insert blog posts"
    ON public.blog_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.jwt() ->> 'sub')
            AND users.is_admin = true
        )
    );

-- Policy: Only admins can update posts
CREATE POLICY "Only admins can update blog posts"
    ON public.blog_posts
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.jwt() ->> 'sub')
            AND users.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.jwt() ->> 'sub')
            AND users.is_admin = true
        )
    );

-- Policy: Only admins can delete posts
CREATE POLICY "Only admins can delete blog posts"
    ON public.blog_posts
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.jwt() ->> 'sub')
            AND users.is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT ON public.blog_posts TO anon;
GRANT ALL ON public.blog_posts TO authenticated;
