# TypeScript Type Generation Guide

This guide explains how to generate and maintain TypeScript types for the Supabase backend integration.

## Overview

The application uses TypeScript types generated from the Supabase database schema to ensure type safety between the frontend and backend. These types are automatically generated from the database schema and should be regenerated whenever the database schema changes.

## Type Files

### 1. `types/supabase.ts`

This is the main generated types file that contains:

- **Database interface**: Complete type definitions for all tables, views, functions, and enums
- **Helper types**: Convenient type aliases for common operations
- **Table types**: Specific exports for each table (Profile, BucketList, etc.)
- **View types**: Types for database views (LeaderboardEntry, UserFeedEvent)

**Important**: This file should be regenerated from the database schema, not manually edited.

### 2. `types/bucket-list.ts`

Frontend-specific types that:

- Extend database types with UI-friendly property names (camelCase)
- Provide conversion functions between database and frontend formats
- Add UI-specific properties not present in the database

## Generating Types

### Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Project ID**: Found in your Supabase project settings
3. **Supabase CLI**: Installed via npm (included in package.json)

### Method 1: Using npm Script (Recommended)

```bash
# Set your project ID as an environment variable
# Windows (CMD)
set SUPABASE_PROJECT_ID=your-project-id-here
npm run types:generate

# Windows (PowerShell)
$env:SUPABASE_PROJECT_ID="your-project-id-here"
npm run types:generate

# Linux/Mac
SUPABASE_PROJECT_ID=your-project-id-here npm run types:generate
```

### Method 2: Direct CLI Command

```bash
npx supabase gen types typescript --project-id your-project-id-here > types/supabase.ts
```

### Method 3: Using Linked Project

If you've linked your local project to Supabase:

```bash
# Link your project (one-time setup)
npx supabase link --project-ref your-project-id

# Generate types
npx supabase gen types typescript --linked > types/supabase.ts
```

## When to Regenerate Types

You should regenerate types whenever:

1. **After running migrations**: Any database schema changes
2. **After adding tables**: New tables or columns
3. **After modifying constraints**: Changes to enums, check constraints, etc.
4. **After updating functions**: New or modified database functions
5. **After creating views**: New or modified database views

## Workflow

### 1. Make Database Changes

```bash
# Create a new migration
npx supabase migration new add_new_feature

# Edit the migration file in supabase/migrations/
# Apply the migration to your Supabase project
```

### 2. Regenerate Types

```bash
npm run types:generate
```

### 3. Update Frontend Types (if needed)

If you added new tables or significantly changed existing ones, update `types/bucket-list.ts`:

- Add conversion functions for new types
- Update existing conversion functions if column names changed
- Add new frontend-specific interfaces if needed

### 4. Update Service Layer

Update `lib/bucket-list-service.ts` to use the new types:

- Import new types from `@/types/supabase`
- Update function signatures
- Add new service functions for new tables

### 5. Verify Type Safety

```bash
# Check for TypeScript errors
npm run build

# Or use your IDE's TypeScript checking
```

## Type Usage Examples

### Using Database Types Directly

```typescript
import { supabase } from '@/lib/supabase'
import type { BucketList, BucketListInsert, BucketListUpdate } from '@/types/supabase'

// Fetching data - automatically typed
const { data: lists } = await supabase
  .from('bucket_lists')
  .select('*')
// data is typed as BucketList[] | null

// Inserting data
const newList: BucketListInsert = {
  user_id: userId,
  name: 'My Adventures',
  category: 'adventures',
  description: 'Places I want to visit',
}

const { data } = await supabase
  .from('bucket_lists')
  .insert(newList)
  .select()
  .single()
// data is typed as BucketList | null

// Updating data
const updates: BucketListUpdate = {
  name: 'Updated Name',
  is_public: true,
}

await supabase
  .from('bucket_lists')
  .update(updates)
  .eq('id', listId)
```

### Using Frontend Types

```typescript
import { toBucketList, toUserProfile } from '@/types/bucket-list'
import type { BucketList as FrontendBucketList } from '@/types/bucket-list'

// Fetch from database
const { data: dbList } = await supabase
  .from('bucket_lists')
  .select('*, bucket_items(*)')
  .eq('id', listId)
  .single()

// Convert to frontend format
const frontendList: FrontendBucketList = toBucketList(
  dbList,
  dbList.bucket_items,
  isFollowing
)

// Now use in React components with camelCase properties
<ListCard
  name={frontendList.name}
  category={frontendList.category}
  followers={frontendList.followers}
  isFollowing={frontendList.isFollowing}
/>
```

### Using Helper Types

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

// Generic function that works with any table
function createRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  data: TablesInsert<T>
) {
  return supabase.from(table).insert(data).select().single()
}

// Usage
const profile = await createRecord('profiles', {
  id: userId,
  username: 'johndoe',
})
```

## Type Safety Best Practices

### 1. Always Use Generated Types

```typescript
// ✅ Good - uses generated types
import type { Profile } from '@/types/supabase'

// ❌ Bad - manually defined types can drift from schema
interface Profile {
  id: string
  username: string
  // ... might be outdated
}
```

### 2. Use Conversion Functions

```typescript
// ✅ Good - consistent conversion
import { toUserProfile } from '@/types/bucket-list'
const profile = toUserProfile(dbProfile)

// ❌ Bad - manual conversion prone to errors
const profile = {
  id: dbProfile.id,
  username: dbProfile.username,
  avatar: dbProfile.avatar_url || '/default.jpg',
  // ... might miss fields
}
```

### 3. Leverage TypeScript Inference

```typescript
// ✅ Good - let TypeScript infer the type
const { data } = await supabase
  .from('profiles')
  .select('username, avatar_url')
  .single()
// TypeScript knows the exact shape

// ❌ Bad - unnecessary type assertion
const { data } = await supabase
  .from('profiles')
  .select('*')
  .single() as { username: string }
```

### 4. Use Specific Insert/Update Types

```typescript
// ✅ Good - uses specific Insert type
const newItem: BucketItemInsert = {
  bucket_list_id: listId,
  title: 'Climb Mt. Everest',
  points: 500,
}

// ❌ Bad - uses Row type which includes generated fields
const newItem: BucketItem = {
  id: '', // shouldn't need to provide this
  bucket_list_id: listId,
  title: 'Climb Mt. Everest',
  created_at: '', // shouldn't need to provide this
  // ...
}
```

## Troubleshooting

### Error: "Project not found"

Make sure your `SUPABASE_PROJECT_ID` is correct and you have access to the project.

### Error: "Authentication required"

You may need to log in to Supabase CLI:

```bash
npx supabase login
```

### Types Don't Match Database

1. Verify migrations are applied to your Supabase project
2. Regenerate types
3. Clear TypeScript cache: `rm -rf .next` and restart your IDE

### Type Errors After Regeneration

1. Check if column names changed (snake_case in DB)
2. Update conversion functions in `types/bucket-list.ts`
3. Update service layer functions in `lib/bucket-list-service.ts`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate types
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: npm run types:generate
      
      - name: Type check
        run: npm run build
```

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Summary

1. **Generate types after every schema change**
2. **Use generated types, don't manually define them**
3. **Use conversion functions for frontend types**
4. **Leverage TypeScript's type inference**
5. **Keep types in version control**
6. **Automate type generation in CI/CD**

By following these practices, you'll maintain type safety across your entire application and catch potential bugs at compile time rather than runtime.
