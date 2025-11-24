# API Usage Guide

## Overview

This guide provides comprehensive documentation for using the Supabase backend API in the Bucket List application. The application uses Supabase as a Backend-as-a-Service (BaaS) platform, providing PostgreSQL database, authentication, storage, and real-time capabilities.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Bucket Lists](#bucket-lists)
- [Bucket Items](#bucket-items)
- [Memories](#memories)
- [Social Features](#social-features)
- [Timeline](#timeline)
- [Leaderboard](#leaderboard)
- [Profile Management](#profile-management)
- [Error Handling](#error-handling)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or pnpm package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bucket-list-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Supabase project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migrations in the `supabase/migrations` folder
   - Enable Row Level Security on all tables

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials (see [Environment Variables](#environment-variables))

5. **Generate TypeScript types**
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Variable Descriptions

| Variable | Description | Required | Public |
|----------|-------------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side operations | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations (server-side only) | No | No |

**Security Notes:**
- Never commit `.env.local` to version control
- Only use `NEXT_PUBLIC_` prefix for variables that should be exposed to the browser
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and only use server-side

## Authentication

### Sign Up

Create a new user account with email and password.

```typescript
import { supabase } from '@/lib/supabase'

async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}
```

**Response:**
```typescript
{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    user_metadata: {
      username: 'johndoe'
    }
  },
  session: {
    access_token: 'jwt-token',
    refresh_token: 'refresh-token'
  }
}
```

### Sign In

Authenticate an existing user.

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}
```

### Sign Out

End the current user session.

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
```

### Get Current User

Retrieve the currently authenticated user.

```typescript
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}
```

### Password Reset

Request a password reset email.

```typescript
async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}
```

### Update Password

Update the user's password (after reset).

```typescript
async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}
```

## Bucket Lists

### Create Bucket List

Create a new bucket list.

```typescript
import { supabase } from '@/lib/supabase'

async function createBucketList(data: {
  name: string
  description?: string
  category: string
  is_public?: boolean
}) {
  const { data: bucketList, error } = await supabase
    .from('bucket_lists')
    .insert({
      name: data.name,
      description: data.description,
      category: data.category,
      is_public: data.is_public ?? true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return bucketList
}
```

**Valid Categories:**
- `adventures`
- `places`
- `cuisines`
- `books`
- `songs`
- `monuments`
- `acts-of-service`
- `miscellaneous`

### Get User's Bucket Lists

Fetch all bucket lists owned by the current user.

```typescript
async function getUserBucketLists(userId: string) {
  const { data, error } = await supabase
    .from('bucket_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
```

### Get Public Bucket Lists

Fetch public bucket lists with optional filtering.

```typescript
async function getPublicBucketLists(options?: {
  category?: string
  search?: string
  limit?: number
}) {
  let query = supabase
    .from('bucket_lists')
    .select('*, profiles(username, avatar_url)')
    .eq('is_public', true)

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}
```

### Update Bucket List

Update an existing bucket list.

```typescript
async function updateBucketList(
  listId: string,
  updates: {
    name?: string
    description?: string
    category?: string
    is_public?: boolean
  }
) {
  const { data, error } = await supabase
    .from('bucket_lists')
    .update(updates)
    .eq('id', listId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

### Delete Bucket List

Delete a bucket list and all associated items.

```typescript
async function deleteBucketList(listId: string) {
  const { error } = await supabase
    .from('bucket_lists')
    .delete()
    .eq('id', listId)

  if (error) {
    throw error
  }
}
```

## Bucket Items

### Add Item to List

Add a new item to a bucket list.

```typescript
async function addBucketItem(data: {
  bucket_list_id: string
  title: string
  description?: string
  points?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  location?: string
}) {
  const { data: item, error } = await supabase
    .from('bucket_items')
    .insert({
      bucket_list_id: data.bucket_list_id,
      title: data.title,
      description: data.description,
      points: data.points ?? 50,
      difficulty: data.difficulty,
      location: data.location,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return item
}
```

**Validation Rules:**
- `title`: 3-200 characters
- `points`: 1-1000
- `difficulty`: 'easy', 'medium', or 'hard'

### Get Items for List

Fetch all items in a bucket list.

```typescript
async function getBucketItems(listId: string) {
  const { data, error } = await supabase
    .from('bucket_items')
    .select('*')
    .eq('bucket_list_id', listId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
```

### Mark Item as Completed

Complete a bucket item (triggers automatic points update).

```typescript
async function completeItem(itemId: string) {
  const { data, error } = await supabase
    .from('bucket_items')
    .update({ completed: true })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

**Automatic Actions:**
- User's total points are increased by item points
- User's items_completed counter is incremented
- Timeline event is created
- Global rank is recalculated

### Update Bucket Item

Update an existing bucket item.

```typescript
async function updateBucketItem(
  itemId: string,
  updates: {
    title?: string
    description?: string
    points?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    location?: string
  }
) {
  const { data, error } = await supabase
    .from('bucket_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

### Delete Bucket Item

Delete a bucket item.

```typescript
async function deleteBucketItem(itemId: string) {
  const { error } = await supabase
    .from('bucket_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw error
  }
}
```

## Memories

### Create Memory

Create a memory for a completed item with photos.

```typescript
async function createMemory(data: {
  bucket_item_id: string
  reflection: string
  photos: File[]
  is_public?: boolean
}) {
  const userId = (await supabase.auth.getUser()).data.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Upload photos first
  const photoUrls: string[] = []

  for (const photo of data.photos) {
    const fileName = `${userId}/${Date.now()}-${photo.name}`
    const { error: uploadError } = await supabase.storage
      .from('memory-photos')
      .upload(fileName, photo)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('memory-photos')
      .getPublicUrl(fileName)

    photoUrls.push(publicUrl)
  }

  // Create memory record
  const { data: memory, error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      bucket_item_id: data.bucket_item_id,
      reflection: data.reflection,
      photos: photoUrls,
      is_public: data.is_public ?? true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return memory
}
```

**Validation Rules:**
- `reflection`: 10-5000 characters
- `photos`: Each file must be under 10MB

### Get Memories for Item

Fetch memories associated with a bucket item.

```typescript
async function getMemoriesForItem(itemId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('*, profiles(username, avatar_url)')
    .eq('bucket_item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
```

### Update Memory

Update an existing memory.

```typescript
async function updateMemory(
  memoryId: string,
  updates: {
    reflection?: string
    is_public?: boolean
  }
) {
  const { data, error } = await supabase
    .from('memories')
    .update(updates)
    .eq('id', memoryId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

### Delete Memory

Delete a memory and associated photos.

```typescript
async function deleteMemory(memoryId: string) {
  // Get memory to find photos
  const { data: memory } = await supabase
    .from('memories')
    .select('photos')
    .eq('id', memoryId)
    .single()

  // Delete photos from storage
  if (memory?.photos) {
    for (const photoUrl of memory.photos) {
      const path = photoUrl.split('/memory-photos/')[1]
      if (path) {
        await supabase.storage.from('memory-photos').remove([path])
      }
    }
  }

  // Delete memory record
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)

  if (error) {
    throw error
  }
}
```

## Social Features

### Follow Bucket List

Follow another user's bucket list.

```typescript
async function followBucketList(listId: string) {
  const { data, error } = await supabase
    .from('list_followers')
    .insert({
      bucket_list_id: listId,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

**Automatic Actions:**
- List's follower_count is incremented
- Timeline event is created

### Unfollow Bucket List

Unfollow a bucket list.

```typescript
async function unfollowBucketList(listId: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id

  const { error } = await supabase
    .from('list_followers')
    .delete()
    .eq('bucket_list_id', listId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
```

**Automatic Actions:**
- List's follower_count is decremented

### Get Followed Lists

Get all lists followed by the current user.

```typescript
async function getFollowedLists(userId: string) {
  const { data, error } = await supabase
    .from('list_followers')
    .select('bucket_lists(*, profiles(username, avatar_url))')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return data
}
```

### Get Social Feed

Get timeline events from followed users.

```typescript
async function getSocialFeed(options?: {
  limit?: number
  offset?: number
}) {
  const { data, error } = await supabase
    .from('user_feed_view')
    .select('*')
    .limit(options?.limit ?? 20)
    .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 20) - 1)

  if (error) {
    throw error
  }

  return data
}
```

## Timeline

### Get User Timeline

Fetch timeline events for a user.

```typescript
async function getUserTimeline(userId: string, options?: {
  limit?: number
  offset?: number
}) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 20)
    .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 20) - 1)

  if (error) {
    throw error
  }

  return data
}
```

### Create Timeline Event

Manually create a timeline event (most are created automatically).

```typescript
async function createTimelineEvent(data: {
  event_type: 'item_completed' | 'memory_uploaded' | 'memory_shared' | 'list_created' | 'list_followed' | 'achievement_unlocked'
  title: string
  description?: string
  metadata?: Record<string, any>
  is_public?: boolean
}) {
  const { data: event, error } = await supabase
    .from('timeline_events')
    .insert({
      event_type: data.event_type,
      title: data.title,
      description: data.description,
      metadata: data.metadata ?? {},
      is_public: data.is_public ?? true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return event
}
```

## Leaderboard

### Get Leaderboard

Fetch the top users by points.

```typescript
async function getLeaderboard(options?: {
  limit?: number
}) {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .limit(options?.limit ?? 100)

  if (error) {
    throw error
  }

  return data
}
```

### Get User Rank

Get a specific user's rank.

```typescript
async function getUserRank(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('global_rank, total_points')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}
```

## Profile Management

### Get Profile

Fetch a user's profile.

```typescript
async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}
```

### Update Profile

Update the current user's profile.

```typescript
async function updateProfile(updates: {
  username?: string
  bio?: string
  avatar_url?: string
}) {
  const userId = (await supabase.auth.getUser()).data.user?.id

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

**Validation Rules:**
- `username`: 3-30 characters, unique
- `bio`: Max 500 characters

### Upload Avatar

Upload a new avatar image.

```typescript
async function uploadAvatar(file: File) {
  const userId = (await supabase.auth.getUser()).data.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const fileName = `${userId}/avatar-${Date.now()}.${file.name.split('.').pop()}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (uploadError) {
    throw uploadError
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl })

  return publicUrl
}
```

## Error Handling

### Error Response Format

All Supabase errors follow this structure:

```typescript
interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `PGRST116` | Row not found | 404 |
| `23505` | Unique constraint violation | 409 |
| `23503` | Foreign key violation | 409 |
| `42501` | Insufficient privilege | 403 |
| `PGRST301` | JWT expired | 401 |

### Error Handling Example

```typescript
import { handleSupabaseError } from '@/lib/error-handler'

async function safeOperation() {
  try {
    const { data, error } = await supabase
      .from('bucket_lists')
      .select('*')

    if (error) {
      const apiError = handleSupabaseError(error)
      console.error('API Error:', apiError)
      throw apiError
    }

    return data
  } catch (error) {
    // Handle error in UI
    console.error('Operation failed:', error)
    throw error
  }
}
```

### Validation Errors

Client-side validation should be performed before API calls:

```typescript
import { validateBucketListName, validatePoints } from '@/lib/validation'

function validateBucketListData(data: any) {
  const errors: string[] = []

  if (!validateBucketListName(data.name)) {
    errors.push('Name must be between 3 and 100 characters')
  }

  if (data.points && !validatePoints(data.points)) {
    errors.push('Points must be between 1 and 1000')
  }

  return errors
}
```

## Best Practices

### 1. Use TypeScript Types

Always use the generated TypeScript types for type safety:

```typescript
import { Database } from '@/types/supabase'

type BucketList = Database['public']['Tables']['bucket_lists']['Row']
type BucketListInsert = Database['public']['Tables']['bucket_lists']['Insert']
```

### 2. Handle Loading States

Always handle loading states in your UI:

```typescript
const [loading, setLoading] = useState(false)

async function fetchData() {
  setLoading(true)
  try {
    const data = await getBucketLists()
    // Update UI
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false)
  }
}
```

### 3. Implement Optimistic Updates

For better UX, update the UI optimistically:

```typescript
async function completeItemOptimistic(itemId: string) {
  // Update UI immediately
  setItems(items.map(item => 
    item.id === itemId ? { ...item, completed: true } : item
  ))

  try {
    // Perform actual update
    await completeItem(itemId)
  } catch (error) {
    // Revert on error
    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed: false } : item
    ))
    throw error
  }
}
```

### 4. Use SWR or React Query for Caching

Implement data caching for better performance:

```typescript
import useSWR from 'swr'

function useBucketLists(userId: string) {
  const { data, error, mutate } = useSWR(
    ['bucket-lists', userId],
    () => getUserBucketLists(userId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    lists: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
```

### 5. Sanitize User Input

Always sanitize user-generated content:

```typescript
import { sanitizeHtml } from '@/lib/sanitization'

function displayUserContent(content: string) {
  return sanitizeHtml(content)
}
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
