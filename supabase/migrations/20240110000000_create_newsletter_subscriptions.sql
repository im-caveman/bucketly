-- Migration: Create newsletter subscriptions table
-- This migration creates a table for managing newsletter subscriptions

-- ============================================================================
-- NEWSLETTER_SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT true NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'sidebar', -- 'sidebar', 'landing', 'signup', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_source CHECK (source IN ('sidebar', 'landing', 'signup', 'profile', 'other'))
);

-- Create indexes for newsletter_subscriptions table
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email) WHERE subscribed = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id ON public.newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed ON public.newsletter_subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_created_at ON public.newsletter_subscriptions(created_at DESC);

-- Add comment
COMMENT ON TABLE public.newsletter_subscriptions IS 'Newsletter subscription management for email marketing';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Subscriber email address (unique when subscribed)';
COMMENT ON COLUMN public.newsletter_subscriptions.user_id IS 'Optional reference to user account if subscribed while logged in';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Where the subscription originated from';

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_newsletter_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================
CREATE TRIGGER trigger_update_newsletter_subscription_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_newsletter_subscription_updated_at();

-- ============================================================================
-- FUNCTION: Handle unsubscribe (soft delete)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.newsletter_subscriptions
  SET subscribed = false,
      unsubscribed_at = NOW()
  WHERE email = p_email AND subscribed = true;
  
  RETURN FOUND;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Policy: Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage all newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

