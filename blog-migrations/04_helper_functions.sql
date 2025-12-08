-- Helper function to increment blog post view count
-- This allows atomic increments without race conditions

CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = view_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_blog_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_blog_view_count(UUID) TO authenticated;
