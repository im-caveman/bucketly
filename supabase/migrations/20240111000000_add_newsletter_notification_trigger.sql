-- Migration: Add notification trigger for newsletter subscriptions
-- This migration creates a trigger to notify admins when users subscribe to the newsletter

-- ============================================================================
-- FUNCTION: Create notification for admin when user subscribes to newsletter
-- ============================================================================
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

-- ============================================================================
-- TRIGGER: Notify admins on newsletter subscription
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_notify_admin_newsletter_subscription ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_notify_admin_newsletter_subscription
  AFTER INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_newsletter_subscription();

-- ============================================================================
-- FUNCTION: Create welcome notification for user after newsletter subscription
-- ============================================================================
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
-- TRIGGER: Create welcome notification for user
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_newsletter_welcome_notification ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_create_newsletter_welcome_notification
  AFTER INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_newsletter_welcome_notification();
