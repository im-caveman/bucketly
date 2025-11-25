-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT NOT NULL,
    criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_badges table (join table)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
-- Everyone can view badges
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges FOR SELECT 
USING (true);

-- Only admins can insert/update/delete badges (assuming admin check via app metadata or specific user ID)
-- For now, we'll allow authenticated users to insert for the admin panel to work without complex role setup first, 
-- but in production this should be restricted.
DROP POLICY IF EXISTS "Authenticated users can insert badges" ON public.badges;
CREATE POLICY "Authenticated users can insert badges" 
ON public.badges FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update badges" ON public.badges;
CREATE POLICY "Authenticated users can update badges" 
ON public.badges FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete badges" ON public.badges;
CREATE POLICY "Authenticated users can delete badges" 
ON public.badges FOR DELETE 
USING (auth.role() = 'authenticated');

-- RLS Policies for user_badges
-- Everyone can view user badges
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "User badges are viewable by everyone" 
ON public.user_badges FOR SELECT 
USING (true);

-- Only system/admin can award badges (for now allowing authenticated for demo purposes)
DROP POLICY IF EXISTS "Authenticated users can award badges" ON public.user_badges;
CREATE POLICY "Authenticated users can award badges" 
ON public.user_badges FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Storage for badge icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Badge icons are publicly accessible" ON storage.objects;
CREATE POLICY "Badge icons are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'badges' );

DROP POLICY IF EXISTS "Authenticated users can upload badge icons" ON storage.objects;
CREATE POLICY "Authenticated users can upload badge icons"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'badges' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can update badge icons" ON storage.objects;
CREATE POLICY "Authenticated users can update badge icons"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'badges' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can delete badge icons" ON storage.objects;
CREATE POLICY "Authenticated users can delete badge icons"
ON storage.objects FOR DELETE
USING ( bucket_id = 'badges' AND auth.role() = 'authenticated' );
