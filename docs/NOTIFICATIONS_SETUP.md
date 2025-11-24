# Notifications System Setup Guide

## Overview

The notifications system allows admins to broadcast announcements to all users on the platform. Users receive notifications in real-time in the right sidebar notification center.

## Database Setup

### Migration Files

1. **`20240109000000_create_notifications.sql`** - Creates the notifications table and initial functions
2. **`20240109000001_update_admin_notification_security.sql`** - Adds admin security check to the broadcast function

### Running Migrations

If you've already run the first migration, you need to run the second one to add the admin security check:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/20240109000001_update_admin_notification_security.sql
```

### Enabling Real-time Replication

Supabase enables real-time by default, but verify in your Supabase dashboard:

1. Go to **Database** → **Replication**
2. Ensure `notifications` table has replication enabled
3. If not, click the toggle to enable it

## Features

### Admin Features

1. **Automatic Notifications**
   - When an admin creates a new public bucket list, all users automatically receive a notification
   - Notification includes list name, category, and item count

2. **Manual Notifications**
   - Admins can send custom notifications via the Admin Panel → Notifications tab
   - Choose notification type (info, success, warning, error)
   - Set priority (low, medium, high)
   - Use quick templates for common announcements

### User Features

1. **Real-time Updates**
   - Notifications appear instantly when sent by admins
   - No page refresh needed

2. **Notification Management**
   - Mark notifications as read by clicking them
   - Delete individual notifications
   - Clear all notifications at once
   - Unread count badge shows number of unread notifications

## Testing

### Test Admin Notification Creation

1. Log in as an admin user
2. Go to Admin Panel → Notifications tab
3. Fill in the form:
   - Title: "Test Notification"
   - Message: "This is a test notification"
   - Type: Success
   - Priority: Medium
4. Click "Send to All Users"
5. Check that all users (including yourself) receive the notification

### Test Automatic Notification

1. Log in as an admin user
2. Go to Admin Panel → Lists tab
3. Create a new public bucket list
4. Verify that all users receive a notification about the new list

### Test Real-time Updates

1. Open the app in two different browser windows (or incognito + regular)
2. Log in as different users in each window
3. As admin, send a notification
4. Verify it appears in both windows without refreshing

## Troubleshooting

### Notifications Not Appearing

1. **Check Real-time Replication**
   - Verify notifications table has replication enabled in Supabase dashboard

2. **Check RLS Policies**
   - Ensure RLS policies are correctly set up
   - Users should be able to SELECT their own notifications

3. **Check Function Permissions**
   - Verify `create_admin_notification` function exists
   - Check that admin user has `is_admin = true` in profiles table

4. **Check Browser Console**
   - Look for any errors in the browser console
   - Check Network tab for failed API calls

### Admin Cannot Send Notifications

1. **Verify Admin Status**
   ```sql
   SELECT id, email, is_admin FROM profiles WHERE email = 'your-admin-email@example.com';
   ```
   - Ensure `is_admin = true`

2. **Check Function**
   - Verify the updated function with admin check is installed
   - Run the second migration if you haven't already

### Real-time Not Working

1. **Check Supabase Connection**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Check that WebSocket connections are allowed

2. **Check Subscription**
   - Look for subscription errors in browser console
   - Verify the channel name is unique per user

## Security Notes

- Only users with `is_admin = true` can create admin notifications
- The `create_admin_notification` function uses `SECURITY DEFINER` but checks admin status
- Users can only view, update, and delete their own notifications (enforced by RLS)
- Admin notifications are marked with `is_admin_notification = true` flag

## API Reference

### Service Functions

Located in `lib/notification-service.ts`:

- `fetchUserNotifications(userId)` - Get all notifications for a user
- `subscribeToNotifications(userId, callback)` - Subscribe to real-time updates
- `markNotificationAsRead(notificationId, userId)` - Mark as read
- `deleteNotification(notificationId, userId)` - Delete a notification
- `createAdminNotification(title, message, type, priority, metadata)` - Broadcast to all users

### Database Functions

- `create_admin_notification(p_title, p_message, p_type, p_priority, p_metadata)` - SQL function for broadcasting

## Future Enhancements

Potential improvements:
- Notification preferences (users can opt-out of certain types)
- Notification categories/filtering
- Email notifications for important announcements
- Push notifications for mobile
- Notification history/archives
- Scheduled notifications

