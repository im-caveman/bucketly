-- Create database views for complex queries

-- ============================================================================
-- Leaderboard View
-- ============================================================================
-- This view provides a ranked list of users based on their total points
-- Includes user profile information and current rank calculation
-- Requirements: 9.1, 9.2

CREATE VIEW public.leaderboard_view AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.total_points,
  p.global_rank,
  p.items_completed,
  RANK() OVER (ORDER BY p.total_points DESC) as current_rank
FROM public.profiles p
ORDER BY p.total_points DESC;

-- ============================================================================
-- User Feed View
-- ============================================================================
-- This view provides a social feed of public timeline events with user info
-- Joins timeline_events with profiles to show user details
-- Requirements: 12.1, 12.2, 12.3

CREATE VIEW public.user_feed_view AS
SELECT 
  te.id,
  te.user_id,
  te.event_type,
  te.title,
  te.description,
  te.metadata,
  te.created_at,
  p.username,
  p.avatar_url
FROM public.timeline_events te
JOIN public.profiles p ON te.user_id = p.id
WHERE te.is_public = true
ORDER BY te.created_at DESC;
