-- Migration: Fix notification type constraint to include all notification types
-- This migration updates the valid_type constraint to include notification types
-- used by the follow system and other features

-- Drop the old constraint
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS valid_type;

-- Add the new constraint with all valid notification types
ALTER TABLE public.notifications
ADD CONSTRAINT valid_type CHECK (type IN (
  'info',
  'warning',
  'success',
  'error',
  'new_follower',
  'follower_completion',
  'list_followed',
  'item_completed',
  'badge_earned',
  'admin_announcement'
));

COMMENT ON CONSTRAINT valid_type ON public.notifications IS 'Valid notification types including system-generated notifications';
