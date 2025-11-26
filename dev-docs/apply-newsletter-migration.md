# Quick Guide: Apply Newsletter Migration

## Step 1: Copy the Migration SQL

**IMPORTANT**: Use this complete migration file:
```
supabase/migrations/APPLY_THIS_COMPLETE_NEWSLETTER_MIGRATION.sql
```

This file includes:
- ✅ Newsletter subscriptions table creation
- ✅ All necessary functions and triggers
- ✅ Notification integration
- ✅ Row-level security policies

## Step 2: Apply via Supabase Dashboard

1. Open your Supabase project: https://qtgcrpdmxnemndahojsm.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `APPLY_THIS_COMPLETE_NEWSLETTER_MIGRATION.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success. No rows returned" message

## Step 3: Verify Migration Success

You should see:
- ✅ "Success. No rows returned"
- No error messages

## Step 4: Test the Newsletter

1. **Test as Anonymous User**:
   - Go to any page with the newsletter component
   - Enter your email
   - Click "Subscribe to Newsletter"
   - Should see: "You've been subscribed to our newsletter. We'll keep you updated!"

2. **Test as Logged-in User**:
   - Log in to your account
   - Subscribe to the newsletter
   - Should see: "Check your notifications for a welcome message!"
   - Open notifications panel - you should see a welcome notification

3. **Test as Admin**:
   - After someone subscribes, check your notifications
   - Should see: "New Newsletter Subscription"

## Troubleshooting

### If you see "function already exists" error:
This is fine - it means the migration was already applied. The `CREATE OR REPLACE` statements will update the functions.

### If you see "permission denied" error:
Make sure you're logged in as a user with admin privileges in Supabase.

### If newsletter subscription still shows errors:
1. Clear your browser cache
2. Restart the Next.js dev server: `npm run dev`
3. Check the browser console for any new error messages

## What This Migration Does

1. **Creates Admin Notification Function**: 
   - Notifies all admin users when someone subscribes to the newsletter
   - Includes subscriber email and source in metadata

2. **Creates User Welcome Notification Function**:
   - Sends a welcome notification to registered users who subscribe
   - Only for logged-in users (anonymous subscribers don't get in-app notifications)

3. **Sets Up Triggers**:
   - Automatically runs these functions when a new subscription is created
   - No manual intervention needed after migration

## Migration SQL Preview

```sql
-- Creates two triggers:
-- 1. notify_admin_newsletter_subscription
-- 2. create_newsletter_welcome_notification

-- Both trigger on INSERT to newsletter_subscriptions table
```

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Look at the browser console for client-side errors
3. Verify the migration was applied successfully in SQL Editor
4. Ensure your user has the correct permissions

---

**Note**: This migration is safe to run multiple times. The `CREATE OR REPLACE` and `DROP TRIGGER IF EXISTS` statements ensure idempotency.
