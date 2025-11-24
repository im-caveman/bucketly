-- Migration: Create notifications table for admin announcements and user notifications
-- This migration creates a notifications system for admin-to-user communication

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'medium',
  read BOOLEAN DEFAULT false NOT NULL,
  is_admin_notification BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT message_length CHECK (char_length(message) >= 1 AND char_length(message) <= 1000),
  CONSTRAINT valid_type CHECK (type IN ('info', 'warning', 'success', 'error')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_admin ON public.notifications(is_admin_notification);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Add comment
COMMENT ON TABLE public.notifications IS 'User notifications including admin announcements';
COMMENT ON COLUMN public.notifications.is_admin_notification IS 'True if this is a broadcast notification from admin to all users';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data like list_id, item_id, etc.';

-- ============================================================================
-- FUNCTION: Create admin notification (broadcast to all users)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  is_admin_user BOOLEAN;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if current user is admin
  SELECT is_admin INTO is_admin_user
  FROM public.profiles
  WHERE id = current_user_id;
  
  -- Only allow admins to create notifications
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Only administrators can create admin notifications';
  END IF;
  
  -- Insert notification for all users
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    priority,
    is_admin_notification,
    metadata
  )
  SELECT
    id,
    p_title,
    p_message,
    p_type,
    p_priority,
    true,
    p_metadata
  FROM auth.users;
END;
$$;

COMMENT ON FUNCTION public.create_admin_notification IS 'Creates a notification for all users (admin broadcast)';

-- ============================================================================
-- FUNCTION: Mark notification as read
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET read = true,
      updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.mark_notification_read IS 'Marks a notification as read for a specific user';

-- ============================================================================
-- FUNCTION: Delete notification
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_notification(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE id = p_notification_id
    AND user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.delete_notification IS 'Deletes a notification for a specific user';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can create notifications (via function, not direct insert)
-- The create_admin_notification function uses SECURITY DEFINER

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

