-- ============================================================================
-- COMPLETE NEWSLETTER MIGRATION
-- This migration creates the newsletter_subscriptions table and notification triggers
-- Apply this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE NEWSLETTER_SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT true NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'sidebar',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_source CHECK (source IN ('sidebar', 'landing', 'signup', 'profile', 'other'))
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email 
  ON public.newsletter_subscriptions(email) WHERE subscribed = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id 
  ON public.newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed 
  ON public.newsletter_subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_created_at 
  ON public.newsletter_subscriptions(created_at DESC);

-- Add comments
COMMENT ON TABLE public.newsletter_subscriptions IS 'Newsletter subscription management for email marketing';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Subscriber email address (unique when subscribed)';
COMMENT ON COLUMN public.newsletter_subscriptions.user_id IS 'Optional reference to user account if subscribed while logged in';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Where the subscription originated from';

-- ============================================================================
-- PART 2: CREATE FUNCTIONS FOR NEWSLETTER TABLE
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_newsletter_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle unsubscribe (soft delete)
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
-- PART 3: CREATE TRIGGERS FOR NEWSLETTER TABLE
-- ============================================================================

-- Trigger: Auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_newsletter_subscription_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_update_newsletter_subscription_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_newsletter_subscription_updated_at();

-- ============================================================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- ============================================================================
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update own newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all newsletter subscriptions" ON public.newsletter_subscriptions;

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

-- ============================================================================
-- PART 5: NOTIFICATION INTEGRATION
-- ============================================================================

-- Function: Create notification for admin when user subscribes to newsletter
CREATE OR REPLACE FUNCTION public.notify_admin_newsletter_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Only create notification for new subscriptions (not resubscriptions)
  IF TG_OP = 'INSERT' AND NEW.subscribed = true THEN
    -- Get all admin users
    FOR admin_user_id IN 
      SELECT id FROM public.profiles WHERE is_admin = true
    LOOP
      -- Create notification for each admin
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        priority,
        is_admin_notification,
        metadata
      ) VALUES (
        admin_user_id,
        'New Newsletter Subscription',
        CASE 
          WHEN NEW.user_id IS NOT NULL THEN 
            'A registered user has subscribed to the newsletter'
          ELSE 
            'A new visitor has subscribed to the newsletter'
        END,
        'info',
        'low',
        false,
        jsonb_build_object(
          'subscription_id', NEW.id,
          'email', NEW.email,
          'source', NEW.source,
          'user_id', NEW.user_id
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_admin_newsletter_subscription IS 'Creates notifications for admins when users subscribe to newsletter';

-- Function: Create welcome notification for user after newsletter subscription
CREATE OR REPLACE FUNCTION public.create_newsletter_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create notification for registered users
  IF TG_OP = 'INSERT' AND NEW.subscribed = true AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      priority,
      is_admin_notification,
      metadata
    ) VALUES (
      NEW.user_id,
      'Welcome to Our Newsletter! 🎉',
      'Thank you for subscribing! You''ll receive updates about new features, tips, and inspiring stories from our community.',
      'success',
      'medium',
      false,
      jsonb_build_object(
        'subscription_id', NEW.id,
        'source', NEW.source,
        'type', 'newsletter_welcome'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_newsletter_welcome_notification IS 'Creates a welcome notification for users who subscribe to the newsletter';

-- ============================================================================
-- PART 6: CREATE NOTIFICATION TRIGGERS
-- ============================================================================

-- Trigger: Notify admins on newsletter subscription
DROP TRIGGER IF EXISTS trigger_notify_admin_newsletter_subscription ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_notify_admin_newsletter_subscription
  AFTER INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_newsletter_subscription();

-- Trigger: Create welcome notification for user
DROP TRIGGER IF EXISTS trigger_create_newsletter_welcome_notification ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_create_newsletter_welcome_notification
  AFTER INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_newsletter_welcome_notification();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- You should see "Success. No rows returned" if everything worked correctly
