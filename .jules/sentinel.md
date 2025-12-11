# Sentinel Journal

## 2024-05-22 - [CRITICAL] Unauthorized Access to Admin Server Actions

**Vulnerability:** Next.js Server Actions in `app/admin/blog/actions.ts` were publicly accessible. While the UI was hidden for non-admins, the underlying server functions (`createPostAction`, `deletePostAction`, etc.) performed no server-side authorization checks. Any authenticated user (or potentially unauthenticated, depending on middleware) could invoke these actions to modify blog posts.

**Learning:** Server Actions are public endpoints by default. Placing them in an `admin/` folder or using client-side checks (`useAdmin` hook) is NOT sufficient security. Authorization must be explicitly verified within the server action itself.

**Prevention:**
1. Always assume Server Actions are public API endpoints.
2. Implement a reusable server-side authorization utility (like `verifyAdmin`).
3. Call this utility at the very beginning of every sensitive Server Action.
4. Do not rely on Middleware for fine-grained action security (Middleware protects routes, not necessarily function calls).
