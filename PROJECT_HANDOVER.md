# Project Handover Documentation

**Last Updated:** December 7, 2024
**Project:** Bucketly
**Version:** 1.0 (Pre-Release/Beta)

---

## 1. Project Overview

**Bucketly** is a gamified bucket list tracking application designed to help users turn dreams into achievements. It combines goal tracking with social accountability and gamification elements like points, badges, and leaderboards.

### Tech Stack
-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS + Shadcn/UI (likely)
-   **Database:** Supabase (PostgreSQL)
-   **Authentication:** Supabase Auth
-   **State Management:** SWR (Data Fetching), React Hooks
-   **Testing:** Vitest

---

## 2. Project Status: Plan vs. Reality

### Completed Features

#### Core Functionality
-   [x] **User Authentication**: Sign up/Login via Supabase.
-   [x] **Bucket List Management**: Create, Read, Update, Delete (CRUD) lists.
    -   Categories: Adventures, Places, Cuisines, Books, Songs, etc.
    -   Difficulties: Easy, Medium, Hard.
    -   Visibility: Public/Private lists.
-   [x] **Item Tracking**: Add items to lists, mark as complete.
    -   **Progress Tracking**: Chapter/Unit tracking for books/series.
    -   **Points System**: Points awarded based on difficulty (Easy=10, Medium=20, Hard=30).

#### Social & Gamification (Recently Completed)
-   [x] **Leaderboard**: Global ranking based on total points.
    -   **Hover Previews**: Interactive cards showing user stats and social links on hover.
-   [x] **Social Profile**:
    -   **Social Links**: Integration for Twitter, Instagram, LinkedIn, GitHub, Website.
    -   **Follow System**: Follow/Unfollow functionality with follower/following counts.
-   [x] **Notifications**:
    -   "User A followed you".
    -   "User B completed [Item]" (sent to followers).
-   [x] **Feed**: Activity feed showing public completions and milestones.

#### Admin & Management
-   [x] **Admin Panel**:
    -   Manage Users (Ban/Unban if implemented, View details).
    -   Manage Public Lists (Edit/Delete).
-   [x] **Legal Pages**: Standalone Privacy Policy and Terms of Service.

#### UI/UX Refinements
-   [x] **Landing Page**: Fully responsive high-conversion landing page with 3D elements (images).
-   [x] **Performance**: Solved page reload issues on tab switching, hydration mismatches.
-   [x] **Responsiveness**: Mobile-optimized layouts for profile, leaderboard, and feed.

### Recent Fixes (Last 7 Days)
1.  **Category Constraint**: Fixed database constraint errors for "travel" vs "places" categories.
2.  **Home Page Reloads**: Fixed unnecessary full-page reloads when returning to the tab.
3.  **Points Logic**: Corrected logic for adding/removing points and timeline events on item completion.
4.  **Admin Editing**: Added "Edit" functionality to Admin List Manager.

---

## 3. Architecture & Codebase Structure

### Key Directories
-   `app/`: Next.js App Router structure.
    -   `(auth)`: Authentication routes.
    -   `(dashboard)`: Protected user routes (feed, profile, lists).
    -   `admin/`: Admin panel routes.
    -   `api/`: Internal API endpoints (if any).
-   `components/`: Reusable UI components.
    -   `ui/`: Base design system components.
    -   `bucket-list/`: List-specific components (`ItemCard`, `ListCard`).
    -   `profile/`: Profile-related components (`UserPreviewModal`).
    -   `admin/`: Admin-specific tables and forms.
-   `lib/`: Core logic and utilities.
    -   `supabase/`: Client initialization.
    -   `utils.ts`: Helper functions.
    -   `*service.ts`: Service layer for database interactions (`user-follow-service.ts`, `bucket-list-service.ts`).
-   `supabase/`: Database configuration.
    -   `migrations/`: SQL migration files.
    -   `seeds/`: Data population scripts (`seed_diverse_lists.sql`).
-   `dev-docs/`: Internal technical documentation.

---

## 4. Database Schema

The database is powered by Supabase (PostgreSQL). Detailed documentation is in `docs/DATABASE_SCHEMA.md`.

### Core Tables
| Table | Description | Key Relationships |
| :--- | :--- | :--- |
| `profiles` | User profile data, stats, social links. | `id` -> `auth.users` |
| `bucket_lists` | Collections of items. | `user_id` -> `profiles` |
| `bucket_items` | Individual goals/tasks. | `bucket_list_id` -> `bucket_lists` |
| `user_follows` | Social graph (follower/following). | `follower_id`, `following_id` -> `profiles` |
| `timeline_events` | History of actions (completions, joins). | `user_id` -> `profiles` |
| `notifications` | User alerts. | `user_id` -> `profiles` |

### Key Views
-   `leaderboard_view`: Pre-calculated ranking of users by points.
-   `user_feed_view`: Aggregated public events for the home feed.

---

## 5. Workflows

### Development Workflow
1.  **Start**: `npm run dev` (Runs on localhost:3000).
2.  **Linting**: `npm run lint`.
3.  **Type Check**: `npm run type-check` (if script exists) or `tsc --noEmit`.

### Database Workflow
1.  **Make Changes**: Modify/Create SQL files in `supabase/migrations/`.
2.  **Apply Local**: `npx supabase db reset` (Caution: wipes local data) or `npx supabase db push` (for schema updates).
3.  **Seed Data**: Use `supabase/seed_*.sql` files to populate test data.

### Deployment Workflow
Detailed checklist available in `dev-docs/DEPLOYMENT_CHECKLIST.md`.
1.  **Build**: `npm run build`.
2.  **Env Variables**: Ensure all `NEXT_PUBLIC_SUPABASE_*` and service keys are set in Vercel.
3.  **Deploy**: Push to `main` extracts to Vercel automatically.

---

## 6. Remaining Work & Future Roadmap

These are the immediate next steps and "nice-to-haves" for the incoming team.

### Immediate To-Do (Stabilization)
-   [ ] **Test Coverage**: Increase unit test coverage for `lib/` services. Currently reliant on manual verification.
-   [ ] **Error Boundaries**: Implement global error boundaries for graceful failure in UI.
-   [ ] **Accessibility Audit**: While basic a11y is done, a full audit (WCAG) is recommended for badges and complex interactive elements.

### Planned Features (Future Enhancements)
-   [ ] **Private Accounts**: Ability to require approval for followers.
-   [ ] **Bulk Actions**: Follow/Unfollow multiple users, bulk delete list items.
-   [ ] **Social Link Verification**: Logic to verify ownership of linked social accounts.
-   [ ] **Direct Messaging**: Allow users to chat (if desired).
-   [ ] **Advanced Gamification**:
    -   Levels (e.g., Level 1 -> Level 50) based on points.
    -   Streaks (Daily login/completion streaks).
-   [ ] **Export Data**: functionality for users to download their data (GDPR compliance).

---

## 7. Resources for the Team

-   **Frontend Guide**: `dev-docs/FRONTEND_DEVELOPER_GUIDE.md`
-   **Security**: `dev-docs/SECURITY_CHECKLIST.md`
-   **API/Services**: `dev-docs/API_USAGE_GUIDE.md`
-   **Type Generation**: `dev-docs/TYPE_GENERATION_GUIDE.md`
