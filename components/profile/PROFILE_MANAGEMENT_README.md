# Profile Management Implementation

This document describes the profile management features implemented for the bucket list application.

## Overview

The profile management system allows users to view and edit their profiles, including personal information, statistics, and achievements. The implementation includes real-time updates for statistics and comprehensive validation.

## Features Implemented

### 1. Profile Display Page (`app/profile/[username]/page.tsx`)

**Features:**
- Displays user profile with avatar, username, bio, and statistics
- Shows user's bucket lists in a tabbed interface
- Displays user's timeline/activity feed
- Real-time statistics updates using Supabase Realtime
- Responsive design with gradient cover and profile card
- Follow button for other users (UI ready)

**Statistics Displayed:**
- Total points earned
- Items completed
- Lists following
- Lists created
- Global rank

### 2. Profile Edit Form (`app/settings/page.tsx`)

**Features:**
- Edit username with validation (3-30 characters, unique)
- Edit bio with character counter (max 500 characters)
- Upload custom avatar image (max 5MB)
- Select from predefined avatar options
- Real-time form validation
- Success/error notifications
- Automatic redirect to profile after save

**Validation:**
- Username: 3-30 characters, must be unique
- Bio: Maximum 500 characters
- Avatar: Maximum 5MB, must be image file
- Email: Display only (cannot be changed)

### 3. Profile Statistics Display

**Features:**
- Real-time statistics updates via Supabase Realtime subscriptions
- Automatic recalculation when items are completed
- Statistics shown on both account and profile pages
- Visual stat cards with icons and labels

**Statistics Tracked:**
- `total_points`: Sum of points from completed items
- `items_completed`: Count of completed bucket items
- `lists_following`: Count of lists user follows
- `lists_created`: Count of lists user created
- `global_rank`: User's rank based on total points

## Service Functions

### Profile Functions (`lib/bucket-list-service.ts`)

#### `fetchUserProfile(userId: string): Promise<UserProfile>`
Fetches a user's profile data by user ID.

#### `updateUserProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile>`
Updates user profile with validation:
- Validates username length and uniqueness
- Validates bio length
- Updates timestamp automatically

#### `uploadProfileAvatar(userId: string, file: File): Promise<string>`
Uploads avatar image to Supabase Storage:
- Validates file size (5MB max)
- Validates file type (images only)
- Deletes old avatar automatically
- Returns public URL for new avatar

#### `updateProfileStats(userId: string): Promise<void>`
Calls database function to recalculate user statistics:
- Items completed count
- Lists created count
- Lists following count

#### `subscribeToProfileUpdates(userId: string, callback: Function)`
Subscribes to real-time profile updates:
- Listens for changes to profiles table
- Calls callback with updated profile data
- Returns channel for cleanup

## Database Schema

### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  total_points INTEGER DEFAULT 0,
  global_rank INTEGER,
  items_completed INTEGER DEFAULT 0,
  lists_following INTEGER DEFAULT 0,
  lists_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);
```

### Storage Bucket: avatars
- Public bucket for user avatars
- RLS policies enforce user can only upload/delete their own avatars
- Everyone can view avatars

## Database Functions

### `update_profile_stats(user_uuid UUID)`
Recalculates and updates user statistics:
- Counts completed items from user's lists
- Counts lists created by user
- Counts lists user is following
- Updates profile record with new values

### `recalculate_global_ranks()`
Recalculates global ranks for all users:
- Uses window function RANK() based on total_points
- Updates global_rank for all profiles
- Called automatically after item completion

## Real-Time Updates

The profile pages use Supabase Realtime to subscribe to profile changes:

```typescript
const channel = subscribeToProfileUpdates(userId, (updatedProfile) => {
  setProfile(updatedProfile)
})

// Cleanup on unmount
return () => {
  channel.unsubscribe()
}
```

This ensures statistics are updated immediately when:
- User completes an item
- User creates a new list
- User follows/unfollows a list
- Global ranks are recalculated

## Usage Examples

### Viewing a Profile
Navigate to `/profile/[username]` to view any user's profile.

### Editing Your Profile
1. Navigate to `/settings`
2. Update username, bio, or avatar
3. Click "Save Profile"
4. Automatically redirected to your profile page

### Avatar Upload
1. Click "Change Avatar" in settings
2. Select from predefined avatars OR
3. Click "Upload Image" to upload custom avatar
4. Avatar is validated and uploaded to Supabase Storage
5. Old avatar is automatically deleted

## Error Handling

All profile operations include comprehensive error handling:
- Username uniqueness validation
- File size and type validation
- Network error handling
- User-friendly error messages via toast notifications

## Requirements Satisfied

This implementation satisfies the following requirements:

**Requirement 11.1**: Profile display with statistics
- ✅ Displays username, avatar, bio, total points, global rank, items completed, lists following, and lists created

**Requirement 11.2**: Username validation
- ✅ Validates username is 3-30 characters and unique

**Requirement 11.3**: Avatar upload validation
- ✅ Validates avatar is under 5MB

**Requirement 11.4**: Bio validation
- ✅ Validates bio is under 500 characters

**Requirement 11.5**: Real-time statistics updates
- ✅ Statistics update within seconds via Realtime subscriptions

## Future Enhancements

Potential improvements for future iterations:
- Image cropping/resizing before upload
- Avatar thumbnail generation
- Profile completion percentage
- Achievement badges display
- Activity heatmap/calendar
- Profile customization (themes, colors)
- Social features (followers, following users directly)
