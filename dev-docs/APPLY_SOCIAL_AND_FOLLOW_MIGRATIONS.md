# Apply Social Links and User Follow Migrations

## Quick Start

To enable the new social links and user follow features, you need to apply two database migrations.

## Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed and linked to your project:

```bash
# Apply all pending migrations
npx supabase db push
```

## Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Apply migrations in this order:

### Step 1: Add Social Links (Migration 1)

Copy and paste the contents of:
`supabase/migrations/20240112000000_add_social_links.sql`

Click **Run** to execute.

### Step 2: Add User Follow System (Migration 2)

Copy and paste the contents of:
`supabase/migrations/20240113000000_add_user_follows.sql`

Click **Run** to execute.

## Verification

After applying migrations, verify the changes:

```sql
-- Check profiles table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('twitter_url', 'instagram_url', 'linkedin_url', 'github_url', 'website_url', 'followers_count', 'following_count');

-- Check user_follows table exists
SELECT * FROM information_schema.tables WHERE table_name = 'user_follows';

-- Check triggers are created
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_update_user_follower_counts', 'trigger_notify_followers_on_completion');
```

## What These Migrations Do

### Migration 1: Social Links
- Adds 5 new columns to `profiles` table for social media URLs
- Adds URL format validation constraints
- Allows users to link their social media profiles

### Migration 2: User Follow System
- Creates `user_follows` table to track follower relationships
- Adds `followers_count` and `following_count` columns to profiles
- Creates triggers to automatically update follower counts
- Creates trigger to notify followers when users complete items
- Sets up Row Level Security (RLS) policies

## Features Enabled

After applying these migrations, users can:

✅ Add social media links to their profile (Settings page)
✅ View social links on account pages and leaderboard hover cards
✅ Follow other users from the leaderboard
✅ Receive notifications when followed users complete items
✅ See follower/following counts on profiles

## Troubleshooting

### Error: Column already exists
If you get an error that a column already exists, it means the migration was partially applied. You can either:
1. Drop the existing columns and re-run
2. Skip the already-applied parts

### Error: Trigger already exists
Use `DROP TRIGGER IF EXISTS` before creating triggers, or modify the migration to use `CREATE OR REPLACE`.

### RLS Policy Errors
Make sure you're running the migrations as a superuser or with sufficient privileges.

## Next Steps

After applying migrations:
1. Restart your development server
2. Test the follow functionality in the leaderboard
3. Add social links in Settings
4. Verify notifications are working

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Rollback user follows
DROP TRIGGER IF EXISTS trigger_notify_followers_on_completion ON public.bucket_items;
DROP TRIGGER IF EXISTS trigger_update_user_follower_counts ON public.user_follows;
DROP FUNCTION IF EXISTS notify_followers_on_completion();
DROP FUNCTION IF EXISTS update_user_follower_counts();
DROP TABLE IF EXISTS public.user_follows;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS followers_count,
DROP COLUMN IF EXISTS following_count;

-- Rollback social links
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS twitter_url,
DROP COLUMN IF EXISTS instagram_url,
DROP COLUMN IF EXISTS linkedin_url,
DROP COLUMN IF EXISTS github_url,
DROP COLUMN IF EXISTS website_url;
```
