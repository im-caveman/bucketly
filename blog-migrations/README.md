# Blog System Database Migrations

This folder contains the database migrations for the blog system.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `01_create_blog_posts.sql`
   - `02_create_blog_likes.sql`
   - `03_seed_blog_posts.sql` (optional - adds 3 sample blog posts)

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Copy migrations to supabase/migrations folder
cp blog-migrations/*.sql supabase/migrations/

# Apply migrations
supabase db push
```

## Important Notes

### Before Running Seed Data

In `03_seed_blog_posts.sql`, replace `'YOUR_ADMIN_USER_ID'` with your actual admin user ID from Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Find your admin user
3. Copy the User UID
4. Replace all instances of `'YOUR_ADMIN_USER_ID'` in the seed file

### After Migrations

After applying migrations, regenerate TypeScript types:

```bash
npm run types:generate
```

This will update `types/supabase.ts` with the new blog tables.

## Migration Contents

### 01_create_blog_posts.sql
- Creates `blog_posts` table with all required fields
- Adds indexes for performance (slug, category, status, tags, full-text search)
- Sets up RLS policies (public read for published, admin-only write)
- Creates auto-update trigger for `updated_at` field

### 02_create_blog_likes.sql
- Creates `blog_likes` table
- Ensures unique constraint (one like per user per post)
- Sets up RLS policies (anyone can view, authenticated can like/unlike)

### 03_seed_blog_posts.sql
- Adds 3 sample blog posts:
  - "What is 75 Hard? Complete Beginner's Guide"
  - "Dopamine Detox: Science-Backed Brain Reset"
  - "How to Read 52 Books in a Year"
- All posts marked as published and featured
- Includes realistic content with markdown formatting

## Verification

After applying migrations, verify in Supabase Dashboard:

1. **Database** → **Tables** → Check for `blog_posts` and `blog_likes`
2. **Database** → **Policies** → Verify RLS policies are active
3. **SQL Editor** → Run: `SELECT * FROM blog_posts;` to see seed data
