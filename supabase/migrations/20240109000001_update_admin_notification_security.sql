-- Migration: Add admin check to create_admin_notification function
-- This ensures only admins can broadcast notifications

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
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
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

COMMENT ON FUNCTION public.create_admin_notification IS 'Creates a notification for all users (admin broadcast). Only admins can call this function.';

