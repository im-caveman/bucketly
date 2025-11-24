# TypeScript Type Definitions

This directory contains TypeScript type definitions for the application.

## Supabase Types

The `supabase.ts` file contains auto-generated types from the Supabase database schema.

### Generating Types

When you have a live Supabase project connected, you can regenerate the types using one of these methods:

#### Method 1: Using Project ID

```bash
npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
```

Replace `<your-project-id>` with your actual Supabase project ID (found in your project settings).

#### Method 2: Using Linked Project

If you've linked your project using the Supabase CLI:

```bash
npx supabase gen types typescript --linked > types/supabase.ts
```

#### Method 3: Using npm script

We've added a convenience script to `package.json`:

```bash
npm run types:generate
```

**Note:** You'll need to set the `SUPABASE_PROJECT_ID` environment variable first:

```bash
# Windows (CMD)
set SUPABASE_PROJECT_ID=your-project-id
npm run types:generate

# Windows (PowerShell)
$env:SUPABASE_PROJECT_ID="your-project-id"
npm run types:generate

# Linux/Mac
SUPABASE_PROJECT_ID=your-project-id npm run types:generate
```

### Type Structure

The generated types include:

- **Tables**: All database tables with Row, Insert, and Update types
- **Views**: Database views (leaderboard_view, user_feed_view)
- **Functions**: Database functions (update_profile_stats, recalculate_global_ranks, etc.)
- **Enums**: Enum types (category, difficulty, timeline_event_type)
- **Relationships**: Foreign key relationships between tables

### Helper Types

We've added helper types for easier access:

```typescript
import type { Profile, BucketList, BucketItem } from '@/types/supabase'

// These are equivalent to:
// Database['public']['Tables']['profiles']['Row']
// Database['public']['Tables']['bucket_lists']['Row']
// Database['public']['Tables']['bucket_items']['Row']
```

### Using Types in Components

```typescript
import { supabase } from '@/lib/supabase'
import type { Profile, BucketListInsert } from '@/types/supabase'

// Fetching data
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single()
// profile is typed as Profile

// Inserting data
const newList: BucketListInsert = {
  user_id: userId,
  name: 'My Bucket List',
  category: 'adventures',
  description: 'Places to visit',
}

const { data } = await supabase
  .from('bucket_lists')
  .insert(newList)
  .select()
  .single()
```

## Frontend Types

The `bucket-list.ts` file contains frontend-specific types that adapt the database types for UI components.

### Conversion Functions

We provide conversion functions to transform database types to frontend types:

```typescript
import { toBucketList, toUserProfile, toTimelineEvent } from '@/types/bucket-list'

// Convert database types to frontend types
const bucketList = toBucketList(dbList, dbItems, isFollowing)
const userProfile = toUserProfile(dbProfile)
const timelineEvent = toTimelineEvent(dbEvent)
```

### Why Two Type Systems?

1. **Database Types** (`supabase.ts`): Match the exact database schema with snake_case naming
2. **Frontend Types** (`bucket-list.ts`): Use camelCase naming and include UI-specific properties

This separation allows us to:
- Keep database queries type-safe
- Maintain consistent naming conventions in React components
- Add UI-specific properties without modifying database types
- Easily adapt to database schema changes

## Other Types

- `dashboard.ts`: Dashboard-specific types
- `chat.ts`: Chat feature types

## Best Practices

1. **Always regenerate types after database migrations**
2. **Use the helper types** (Profile, BucketList, etc.) instead of accessing Database['public']['Tables']...
3. **Use conversion functions** when passing data from API to UI components
4. **Keep frontend types in sync** with database types when schema changes
5. **Don't manually edit supabase.ts** - it should always be generated from the database
