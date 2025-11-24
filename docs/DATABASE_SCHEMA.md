# Database Schema Documentation

## Overview

This document provides comprehensive documentation of the database schema for the Bucket List application. The database uses PostgreSQL through Supabase and implements Row Level Security (RLS) for data access control.

## Table of Contents

- [Database Architecture](#database-architecture)
- [Core Tables](#core-tables)
- [Table Relationships](#table-relationships)
- [Row Level Security Policies](#row-level-security-policies)
- [Database Functions](#database-functions)
- [Database Triggers](#database-triggers)
- [Database Views](#database-views)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migration Process](#migration-process)

## Database Architecture

### Design Principles

1. **User-Centric**: All data is associated with users through foreign keys
2. **Normalized**: Separate tables for distinct entities to avoid duplication
3. **Referential Integrity**: Foreign key constraints ensure data consistency
4. **Audit Trails**: Timestamps track creation and modification times
5. **Security First**: RLS policies enforce data access at the database level

### Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │
│ (Supabase)  │
└──────┬──────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌──────────────┐
│  profiles   │                      │bucket_lists  │
└──────┬──────┘                      └──────┬───────┘
       │                                    │
       │                                    ├────────────┐
       │                                    │            │
       │                                    ▼            ▼
       │                            ┌──────────────┐ ┌────────────────┐
       │                            │bucket_items  │ │list_followers  │
       │                            └──────┬───────┘ └────────────────┘
       │                                   │
       ├───────────────────────────────────┤
       │                                   │
       ▼                                   ▼
┌─────────────┐                    ┌──────────────┐
│  memories   │                    │              │
└─────────────┘                    └──────────────┘
       │
       ▼
┌──────────────────┐
│ timeline_events  │
└──────────────────┘
```

## Core Tables

### profiles

Stores user profile information and statistics.

**Schema:**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  total_points INTEGER DEFAULT 0,
  global_rank INTEGER,
  items_completed INTEGER DEFAULT 0,
  lists_following INTEGER DEFAULT 0,
  lists_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | - | Primary key, references auth.users |
| username | TEXT | No | - | Unique username (3-30 chars) |
| avatar_url | TEXT | Yes | NULL | URL to user's avatar image |
| bio | TEXT | Yes | NULL | User biography (max 500 chars) |
| total_points | INTEGER | No | 0 | Total points earned |
| global_rank | INTEGER | Yes | NULL | User's rank on leaderboard |
| items_completed | INTEGER | No | 0 | Count of completed items |
| lists_following | INTEGER | No | 0 | Count of lists user follows |
| lists_created | INTEGER | No | 0 | Count of lists user created |
| created_at | TIMESTAMPTZ | No | NOW() | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Constraints:**
- `username_length`: Username must be 3-30 characters
- `bio_length`: Bio must be max 500 characters

**Indexes:**
- Primary key index on `id`
- Unique index on `username`

---

### bucket_lists

Stores bucket list collections.

**Schema:**
```sql
CREATE TABLE public.bucket_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Owner's user ID |
| name | TEXT | No | - | List name (3-100 chars) |
| description | TEXT | Yes | NULL | List description |
| category | TEXT | No | - | List category |
| is_public | BOOLEAN | No | true | Public visibility flag |
| follower_count | INTEGER | No | 0 | Number of followers |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Constraints:**
- `name_length`: Name must be 3-100 characters
- `valid_category`: Category must be one of: adventures, places, cuisines, books, songs, monuments, acts-of-service, miscellaneous

**Indexes:**
- Primary key index on `id`
- Index on `user_id`
- Index on `category`
- Index on `is_public`

---

### bucket_items

Stores individual items within bucket lists.

**Schema:**
```sql
CREATE TABLE public.bucket_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_list_id UUID NOT NULL REFERENCES public.bucket_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 50,
  difficulty TEXT,
  location TEXT,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| bucket_list_id | UUID | No | - | Parent list ID |
| title | TEXT | No | - | Item title (3-200 chars) |
| description | TEXT | Yes | NULL | Item description |
| points | INTEGER | No | 50 | Points awarded (1-1000) |
| difficulty | TEXT | Yes | NULL | Difficulty level |
| location | TEXT | Yes | NULL | Location information |
| completed | BOOLEAN | No | false | Completion status |
| completed_date | TIMESTAMPTZ | Yes | NULL | Completion timestamp |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Constraints:**
- `title_length`: Title must be 3-200 characters
- `points_range`: Points must be 1-1000
- `valid_difficulty`: Difficulty must be easy, medium, or hard

**Indexes:**
- Primary key index on `id`
- Index on `bucket_list_id`
- Index on `completed`

---

### memories

Stores user memories with photos and reflections.

**Schema:**
```sql
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_item_id UUID NOT NULL REFERENCES public.bucket_items(id) ON DELETE CASCADE,
  reflection TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Memory owner's ID |
| bucket_item_id | UUID | No | - | Associated item ID |
| reflection | TEXT | No | - | Reflection text (10-5000 chars) |
| photos | JSONB | No | '[]'::jsonb | Array of photo URLs |
| is_public | BOOLEAN | No | true | Public visibility flag |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Constraints:**
- `reflection_length`: Reflection must be 10-5000 characters

**Indexes:**
- Primary key index on `id`
- Index on `user_id`
- Index on `bucket_item_id`
- Index on `is_public`

---

### list_followers

Tracks follower relationships between users and bucket lists.

**Schema:**
```sql
CREATE TABLE public.list_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_list_id UUID NOT NULL REFERENCES public.bucket_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bucket_list_id)
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Follower's user ID |
| bucket_list_id | UUID | No | - | Followed list ID |
| created_at | TIMESTAMPTZ | No | NOW() | Follow timestamp |

**Constraints:**
- Unique constraint on `(user_id, bucket_list_id)` combination

**Indexes:**
- Primary key index on `id`
- Index on `user_id`
- Index on `bucket_list_id`

---

### timeline_events

Stores chronological activity events.

**Schema:**
```sql
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Event owner's ID |
| event_type | TEXT | No | - | Type of event |
| title | TEXT | No | - | Event title |
| description | TEXT | Yes | NULL | Event description |
| metadata | JSONB | No | '{}'::jsonb | Additional event data |
| is_public | BOOLEAN | No | true | Public visibility flag |
| created_at | TIMESTAMPTZ | No | NOW() | Event timestamp |

**Constraints:**
- `valid_event_type`: Event type must be one of: item_completed, memory_uploaded, memory_shared, list_created, list_followed, achievement_unlocked

**Indexes:**
- Primary key index on `id`
- Index on `user_id`
- Index on `event_type`
- Index on `created_at` (descending)
- Index on `is_public`

## Table Relationships

### One-to-Many Relationships

1. **auth.users → profiles** (1:1)
   - Each user has exactly one profile
   - Cascade delete: Deleting user deletes profile

2. **auth.users → bucket_lists** (1:N)
   - Each user can own multiple bucket lists
   - Cascade delete: Deleting user deletes their lists

3. **bucket_lists → bucket_items** (1:N)
   - Each list contains multiple items
   - Cascade delete: Deleting list deletes its items

4. **auth.users → memories** (1:N)
   - Each user can create multiple memories
   - Cascade delete: Deleting user deletes their memories

5. **bucket_items → memories** (1:N)
   - Each item can have multiple memories
   - Cascade delete: Deleting item deletes associated memories

6. **auth.users → timeline_events** (1:N)
   - Each user has multiple timeline events
   - Cascade delete: Deleting user deletes their events

### Many-to-Many Relationships

1. **auth.users ↔ bucket_lists** (through list_followers)
   - Users can follow multiple lists
   - Lists can have multiple followers
   - Cascade delete: Deleting user or list removes follow relationship

## Row Level Security Policies

### profiles Table

**Enable RLS:**
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Profiles are viewable by everyone"** (SELECT)
   - Allows: authenticated and anonymous users
   - Condition: Always true
   - Purpose: Public profile viewing

2. **"Users can update own profile"** (UPDATE)
   - Allows: authenticated users
   - Condition: User ID matches profile ID
   - Purpose: Users can only edit their own profile

---

### bucket_lists Table

**Enable RLS:**
```sql
ALTER TABLE public.bucket_lists ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Public lists are viewable by everyone"** (SELECT)
   - Allows: authenticated and anonymous users
   - Condition: List is public OR user owns the list
   - Purpose: Public discovery and owner access

2. **"Users can create own lists"** (INSERT)
   - Allows: authenticated users
   - Condition: User ID matches list owner
   - Purpose: Prevent creating lists for other users

3. **"Users can update own lists"** (UPDATE)
   - Allows: authenticated users
   - Condition: User ID matches list owner
   - Purpose: Only owners can modify their lists

4. **"Users can delete own lists"** (DELETE)
   - Allows: authenticated users
   - Condition: User ID matches list owner
   - Purpose: Only owners can delete their lists

---

### bucket_items Table

**Enable RLS:**
```sql
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Items viewable if list is accessible"** (SELECT)
   - Allows: authenticated and anonymous users
   - Condition: Parent list is public OR user owns the list
   - Purpose: Items inherit list visibility

2. **"Users can add items to own lists"** (INSERT)
   - Allows: authenticated users
   - Condition: User owns the parent list
   - Purpose: Only list owners can add items

3. **"Users can update items in own lists"** (UPDATE)
   - Allows: authenticated users
   - Condition: User owns the parent list
   - Purpose: Only list owners can modify items

4. **"Users can delete items from own lists"** (DELETE)
   - Allows: authenticated users
   - Condition: User owns the parent list
   - Purpose: Only list owners can delete items

---

### memories Table

**Enable RLS:**
```sql
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Memories viewable based on privacy"** (SELECT)
   - Allows: authenticated and anonymous users
   - Condition: Memory is public OR user owns the memory
   - Purpose: Privacy control for memories

2. **"Users can create own memories"** (INSERT)
   - Allows: authenticated users
   - Condition: User ID matches memory owner
   - Purpose: Users create memories for themselves

3. **"Users can update own memories"** (UPDATE)
   - Allows: authenticated users
   - Condition: User ID matches memory owner
   - Purpose: Only owners can edit memories

4. **"Users can delete own memories"** (DELETE)
   - Allows: authenticated users
   - Condition: User ID matches memory owner
   - Purpose: Only owners can delete memories

---

### list_followers Table

**Enable RLS:**
```sql
ALTER TABLE public.list_followers ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Users can view own follows"** (SELECT)
   - Allows: authenticated users
   - Condition: User ID matches follower ID
   - Purpose: Users see their own follows

2. **"Users can follow lists"** (INSERT)
   - Allows: authenticated users
   - Condition: User ID matches follower ID
   - Purpose: Users can follow lists

3. **"Users can unfollow lists"** (DELETE)
   - Allows: authenticated users
   - Condition: User ID matches follower ID
   - Purpose: Users can unfollow lists

---

### timeline_events Table

**Enable RLS:**
```sql
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
```

**Policies:**

1. **"Timeline events viewable based on privacy"** (SELECT)
   - Allows: authenticated and anonymous users
   - Condition: Event is public OR user owns the event
   - Purpose: Privacy control for timeline

2. **"Users can create own events"** (INSERT)
   - Allows: authenticated users
   - Condition: User ID matches event owner
   - Purpose: Users create their own events

3. **"Users can update own events"** (UPDATE)
   - Allows: authenticated users
   - Condition: User ID matches event owner
   - Purpose: Only owners can edit events

4. **"Users can delete own events"** (DELETE)
   - Allows: authenticated users
   - Condition: User ID matches event owner
   - Purpose: Only owners can delete events

## Database Functions

### handle_new_user()

**Purpose:** Automatically create a profile when a new user signs up.

**Trigger:** AFTER INSERT on auth.users

**Logic:**
1. Extract username from user metadata or generate default
2. Insert new profile record with user ID
3. Set default values for statistics

**Security:** SECURITY DEFINER with search_path = public

---

### update_profile_stats(user_uuid UUID)

**Purpose:** Recalculate user statistics.

**Parameters:**
- `user_uuid`: The user's ID

**Logic:**
1. Count completed items for user
2. Count lists created by user
3. Count lists followed by user
4. Update profile with new counts

**Security:** SECURITY DEFINER with search_path = public

---

### recalculate_global_ranks()

**Purpose:** Update global ranks for all users based on points.

**Logic:**
1. Use window function RANK() to calculate ranks
2. Update all profiles with new ranks
3. Order by total_points descending

**Security:** SECURITY DEFINER with search_path = public

---

### increment_follower_count()

**Purpose:** Increase follower count when list is followed.

**Trigger:** AFTER INSERT on list_followers

**Logic:**
1. Get bucket_list_id from new follow record
2. Increment follower_count by 1

**Security:** SECURITY DEFINER with search_path = public

---

### decrement_follower_count()

**Purpose:** Decrease follower count when list is unfollowed.

**Trigger:** AFTER DELETE on list_followers

**Logic:**
1. Get bucket_list_id from deleted follow record
2. Decrement follower_count by 1

**Security:** SECURITY DEFINER with search_path = public

---

### handle_item_completion()

**Purpose:** Process item completion and award points.

**Trigger:** BEFORE UPDATE on bucket_items

**Logic:**
1. Check if item was just completed (completed changed from false to true)
2. Get list owner and item points
3. Update user's total_points and items_completed
4. Create timeline event for completion
5. Set completed_date to current timestamp

**Security:** SECURITY DEFINER with search_path = public

## Database Triggers

### on_auth_user_created

**Table:** auth.users  
**Event:** AFTER INSERT  
**Function:** handle_new_user()  
**Purpose:** Auto-create profile for new users

---

### on_list_followed

**Table:** list_followers  
**Event:** AFTER INSERT  
**Function:** increment_follower_count()  
**Purpose:** Update follower count when list is followed

---

### on_list_unfollowed

**Table:** list_followers  
**Event:** AFTER DELETE  
**Function:** decrement_follower_count()  
**Purpose:** Update follower count when list is unfollowed

---

### on_item_completed

**Table:** bucket_items  
**Event:** BEFORE UPDATE  
**Function:** handle_item_completion()  
**Purpose:** Award points and create timeline event on completion

## Database Views

### leaderboard_view

**Purpose:** Provide ranked list of users by points.

**Schema:**
```sql
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
```

**Columns:**
- All profile columns
- `current_rank`: Real-time rank calculation

---

### user_feed_view

**Purpose:** Provide social feed of public timeline events.

**Schema:**
```sql
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
```

**Columns:**
- All timeline_events columns
- User's username and avatar_url

## Indexes

### Performance Indexes

All indexes are created to optimize common query patterns:

**profiles:**
- Primary key on `id`
- Unique index on `username`

**bucket_lists:**
- Primary key on `id`
- Index on `user_id` (for user's lists)
- Index on `category` (for filtering)
- Index on `is_public` (for public lists)

**bucket_items:**
- Primary key on `id`
- Index on `bucket_list_id` (for list items)
- Index on `completed` (for filtering)

**memories:**
- Primary key on `id`
- Index on `user_id` (for user's memories)
- Index on `bucket_item_id` (for item memories)
- Index on `is_public` (for public memories)

**list_followers:**
- Primary key on `id`
- Index on `user_id` (for user's follows)
- Index on `bucket_list_id` (for list followers)

**timeline_events:**
- Primary key on `id`
- Index on `user_id` (for user's timeline)
- Index on `event_type` (for filtering)
- Index on `created_at DESC` (for chronological order)
- Index on `is_public` (for public events)

## Constraints

### Check Constraints

**profiles:**
- `username_length`: char_length(username) >= 3 AND char_length(username) <= 30
- `bio_length`: char_length(bio) <= 500

**bucket_lists:**
- `name_length`: char_length(name) >= 3 AND char_length(name) <= 100
- `valid_category`: category IN (adventures, places, cuisines, books, songs, monuments, acts-of-service, miscellaneous)

**bucket_items:**
- `title_length`: char_length(title) >= 3 AND char_length(title) <= 200
- `points_range`: points >= 1 AND points <= 1000
- `valid_difficulty`: difficulty IN (easy, medium, hard)

**memories:**
- `reflection_length`: char_length(reflection) >= 10 AND char_length(reflection) <= 5000

**timeline_events:**
- `valid_event_type`: event_type IN (item_completed, memory_uploaded, memory_shared, list_created, list_followed, achievement_unlocked)

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity:

- profiles.id → auth.users.id
- bucket_lists.user_id → auth.users.id
- bucket_items.bucket_list_id → bucket_lists.id
- memories.user_id → auth.users.id
- memories.bucket_item_id → bucket_items.id
- list_followers.user_id → auth.users.id
- list_followers.bucket_list_id → bucket_lists.id
- timeline_events.user_id → auth.users.id

### Unique Constraints

- profiles.username (unique usernames)
- list_followers(user_id, bucket_list_id) (prevent duplicate follows)

## Migration Process

### Migration Files

Migrations are stored in `supabase/migrations/` and executed in order:

1. `20240101000000_create_core_tables.sql` - Create all tables
2. `20240102000000_create_functions_and_triggers.sql` - Create functions and triggers
3. `20240103000000_enable_rls_policies.sql` - Enable RLS and create policies

### Running Migrations

**Local Development:**
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

**Production:**
```bash
# Link to production project
supabase link --project-ref <project-id>

# Push migrations
supabase db push
```

### Creating New Migrations

```bash
# Create new migration file
supabase migration new <migration_name>

# Edit the generated file in supabase/migrations/
# Test locally
supabase db reset

# Push to production
supabase db push
```

### Migration Best Practices

1. **Test Locally First**: Always test migrations in local environment
2. **Backup Before Migration**: Create database backup before production migration
3. **Reversible Migrations**: Include rollback logic when possible
4. **Incremental Changes**: Make small, focused migrations
5. **Document Changes**: Add comments explaining migration purpose
6. **Version Control**: Commit migrations to git before applying

### Rollback Strategy

If a migration fails:

1. **Identify the Issue**: Check error logs
2. **Create Rollback Migration**: Write SQL to undo changes
3. **Test Rollback**: Test in local environment
4. **Apply Rollback**: Run rollback migration in production
5. **Fix Original Migration**: Correct the issue
6. **Reapply**: Test and reapply corrected migration

### Migration Checklist

Before applying migrations to production:

- [ ] Migration tested in local environment
- [ ] Database backup created
- [ ] RLS policies reviewed and tested
- [ ] Indexes created for new columns
- [ ] Constraints validated
- [ ] Functions and triggers tested
- [ ] Rollback plan documented
- [ ] Team notified of migration
- [ ] Maintenance window scheduled (if needed)
- [ ] Post-migration verification plan ready

## Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
