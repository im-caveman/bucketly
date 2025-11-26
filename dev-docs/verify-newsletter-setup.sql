-- ============================================================================
-- VERIFICATION SCRIPT FOR NEWSLETTER SETUP
-- Run this in Supabase SQL Editor to verify the migration was successful
-- ============================================================================

-- Check 1: Verify newsletter_subscriptions table exists
SELECT 
  'newsletter_subscriptions table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'newsletter_subscriptions'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check 2: Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'newsletter_subscriptions'
ORDER BY ordinal_position;

-- Check 3: Verify indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'newsletter_subscriptions'
  AND schemaname = 'public';

-- Check 4: Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_newsletter_subscription_updated_at',
    'unsubscribe_newsletter',
    'notify_admin_newsletter_subscription',
    'create_newsletter_welcome_notification'
  )
ORDER BY routine_name;

-- Check 5: Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'newsletter_subscriptions'
ORDER BY trigger_name;

-- Check 6: Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'newsletter_subscriptions';

-- Check 7: Verify RLS policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'newsletter_subscriptions'
ORDER BY policyname;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- Check 1: Should show "✅ EXISTS"
-- Check 2: Should show 10 columns (id, email, user_id, subscribed, etc.)
-- Check 3: Should show 4 indexes
-- Check 4: Should show 4 functions
-- Check 5: Should show 3 triggers
-- Check 6: Should show rls_enabled = true
-- Check 7: Should show 4 policies
-- ============================================================================
