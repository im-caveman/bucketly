# Quick Reference - Social Links & Follow System

## 🚀 Quick Start (3 Steps)

### 1. Apply Migrations
```bash
npx supabase db push
```
Or manually run these files in Supabase SQL Editor:
- `supabase/migrations/20240112000000_add_social_links.sql`
- `supabase/migrations/20240113000000_add_user_follows.sql`

### 2. Restart Server
```bash
npm run dev
```

### 3. Test
- Settings → Add social links
- Leaderboard → Hover over user → Click Follow

---

## 📁 Key Files

### New Files
```
components/profile/user-preview-modal.tsx    # Hover card component
lib/user-follow-service.ts                   # Follow API functions
hooks/use-user-follow.ts                     # Follow state hook
supabase/migrations/20240112000000_*.sql     # Social links migration
supabase/migrations/20240113000000_*.sql     # Follow system migration
```

### Modified Files
```
app/account/page.tsx                         # Added social sidebar
app/settings/page.tsx                        # Added social inputs
app/leaderboard/page.tsx                     # Pass social data
components/bucket-list/leaderboard-entry.tsx # Added hover preview
hooks/use-leaderboard.ts                     # Fetch social data
types/supabase.ts                            # Updated types
```

---

## 🎯 Features Implemented

### Leaderboard Hover Preview
- Hover over user → See preview card
- Shows: Avatar, username, bio, stats, social links, follow button
- Click avatar/username → Go to profile
- Click social icon → Open in new tab
- Click follow → Toggle follow status

### Social Links
- **Add**: Settings → Social Links section
- **View**: Account page sidebar + Hover cards
- **Platforms**: Twitter, Instagram, LinkedIn, GitHub, Website

### Follow System
- **Follow**: Click button in hover card
- **Notifications**: Followers notified on item completion
- **Counts**: Tracked in profile (followers_count, following_count)

### Performance
- Fixed account page tab reloading
- Used `useMemo` for optimization
- SWR caching for leaderboard

---

## 🔧 API Functions

### Follow Service
```typescript
import { followUser, unfollowUser, isFollowingUser } from '@/lib/user-follow-service'

// Follow a user
await followUser(userId)

// Unfollow a user
await unfollowUser(userId)

// Check if following
const following = await isFollowingUser(userId)
```

### Hook Usage
```typescript
import { useUserFollow } from '@/hooks/use-user-follow'

const { isFollowing, isLoading, toggleFollow } = useUserFollow(userId)

// Toggle follow status
<Button onClick={toggleFollow} disabled={isLoading}>
  {isFollowing ? 'Unfollow' : 'Follow'}
</Button>
```

---

## 🗄️ Database Schema

### New Columns in `profiles`
```sql
twitter_url      TEXT
instagram_url    TEXT
linkedin_url     TEXT
github_url       TEXT
website_url      TEXT
followers_count  INTEGER DEFAULT 0
following_count  INTEGER DEFAULT 0
```

### New Table `user_follows`
```sql
id            UUID PRIMARY KEY
follower_id   UUID REFERENCES auth.users(id)
following_id  UUID REFERENCES auth.users(id)
created_at    TIMESTAMPTZ
```

---

## 🎨 Component Props

### UserPreviewModal
```typescript
<UserPreviewModal
  userId={string}
  username={string}
  avatar={string}
  bio={string}
  totalPoints={number}
  itemsCompleted={number}
  globalRank={number}
  twitterUrl={string}
  instagramUrl={string}
  linkedinUrl={string}
  githubUrl={string}
  websiteUrl={string}
/>
```

### LeaderboardEntry (Updated)
```typescript
<LeaderboardEntry
  rank={number}
  username={string}
  avatar={string}
  points={number}
  completions={number}
  userId={string}              // NEW
  bio={string}                 // NEW
  globalRank={number}          // NEW
  twitterUrl={string}          // NEW
  instagramUrl={string}        // NEW
  linkedinUrl={string}         // NEW
  githubUrl={string}           // NEW
  websiteUrl={string}          // NEW
  isCurrentUser={boolean}
/>
```

---

## 🔔 Notification Types

### New Follower
```json
{
  "type": "new_follower",
  "title": "New Follower",
  "message": "{username} started following you",
  "metadata": {
    "follower_id": "uuid",
    "follower_username": "string"
  }
}
```

### Follower Completion
```json
{
  "type": "follower_completion",
  "title": "{username} completed an item",
  "message": "{username} completed '{item}' from {list}",
  "metadata": {
    "user_id": "uuid",
    "username": "string",
    "item_id": "uuid",
    "item_title": "string",
    "list_name": "string"
  }
}
```

---

## ✅ Testing Checklist

- [ ] Migrations applied successfully
- [ ] Social links save in settings
- [ ] Social icons appear on account page
- [ ] Hover preview shows on leaderboard
- [ ] Follow button works
- [ ] Unfollow button works
- [ ] Follower count updates
- [ ] Notifications sent to followers
- [ ] Social links open in new tab
- [ ] Account page tabs don't reload
- [ ] Mobile responsive

---

## 🐛 Common Issues

### Hover card not showing
- Check Popover component is installed
- Verify `onMouseEnter`/`onMouseLeave` events

### Follow button not working
- Check migrations are applied
- Verify RLS policies are enabled
- Check user is authenticated

### Social links not saving
- Verify URL format (must start with http:// or https://)
- Check database constraints
- Verify user has permission

### Account page reloading
- Ensure `useMemo` is used for static data
- Check no unnecessary state updates

---

## 📚 Documentation Files

- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `SOCIAL_LINKS_AND_FOLLOW_IMPLEMENTATION.md` - Technical specs
- `APPLY_SOCIAL_AND_FOLLOW_MIGRATIONS.md` - Migration guide
- `QUICK_REFERENCE.md` - This file

---

## 🎉 You're Done!

All features are implemented and ready to use. Apply the migrations and start testing!
