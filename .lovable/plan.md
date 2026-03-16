

# QA Analysis — UniVerse App

## Critical Issues

### 1. Hardcoded Green "Online" Dot on Every User
**File:** `src/components/PostCard.tsx` line 158
The green circle (`bg-success`) is rendered unconditionally on every user avatar, falsely indicating everyone is online. There is no presence tracking system.

### 2. Admin Dashboard Accessible via URL (No Server-Side Guard)
**File:** `src/pages/AdminDashboard.tsx`
The `/admin` route only uses a client-side `useAdmin()` check. While the RLS policies protect the data, any user can navigate to `/admin` and see the loading state. The `OnboardingGuard` wrapper does not check admin status — a non-admin user who knows the URL will see a brief flash before being redirected.

### 3. Share Link Copies a Non-Existent Route
**File:** `src/components/PostCard.tsx` line 268
The share button copies `window.location.origin + /post/${id}`, but there is no `/post/:id` route defined in `App.tsx`. Clicking the shared link leads to a 404.

### 4. No Delete Confirmation on Destructive Actions
**Files:** `PostCard.tsx`, `AdminDashboard.tsx`, all admin tabs
Deleting posts, comments, confessions, listings, events, communities, subjects, and notes happens immediately on click with no confirmation dialog. One misclick permanently deletes data.

### 5. AI Assistant Link Points to Dead Route
**File:** `src/pages/CreatePost.tsx` line 70
Links to `/ai`, but no such route exists in `App.tsx`. Results in a 404.

### 6. Confession Wall Leaks User Identity
**File:** `src/pages/ConfessionWall.tsx`
Confessions are labeled "Anonymous Student" in the UI, but the `confessions` table stores `user_id`. The RLS SELECT policy is `true` (everyone can read). While the UI doesn't show who posted, any user with basic API knowledge can query the `user_id` column directly. The confessions are not truly anonymous.

### 7. Optimistic Like State Can Desync
**File:** `src/components/PostCard.tsx` lines 67-83
Like/unlike is optimistic (UI updates immediately) but then calls `onRefresh()` which re-fetches all posts. If the DB operation fails silently, the optimistic state is overwritten. However, no error handling exists — if the insert/delete fails, the user gets no feedback.

---

## Moderate Issues

### 8. No Password Reset / Forgot Password Flow
The login page has no "Forgot password?" link. Users who forget their password have no way to recover their account.

### 9. No Input Validation on Post Content (Beyond 500 Chars)
**File:** `src/pages/CreatePost.tsx`
The character counter shows 500 max, but there is no database constraint enforcing this. A user could bypass the UI and post content of any length via the API.

### 10. Duplicate `spacehub-connect-main/` Directory
The project contains a full duplicate of the source code inside `spacehub-connect-main/`. This is dead code that increases bundle confusion and maintenance burden.

### 11. `usePosts` Fetches ALL Likes and Comments for Count
**File:** `src/hooks/usePosts.ts` lines 44-48
To count likes and comments, the hook fetches every individual like and comment row for all displayed posts. With many posts, this hits the Supabase 1000-row default limit, causing incorrect counts for popular content.

### 12. No Pagination on Feed
**File:** `src/hooks/usePosts.ts`
All posts are fetched at once with no limit or infinite scroll. As the platform grows, this will cause slow load times and excessive data transfer.

### 13. Confession Comments Expose Commenter Identity
**File:** `src/pages/ConfessionWall.tsx` line 326
Comments on "anonymous" confessions show the commenter's display name and avatar. While the confession author is hidden, the commenting system does not preserve anonymity for commenters, which may be unexpected.

---

## Minor Issues

### 14. `PopularUsers` Fetches All Follows for Counting
**File:** `src/components/PopularUsers.tsx` line 36
Fetches ALL follows in the system just to count per-user followers. Will hit the 1000-row limit and show wrong counts at scale.

### 15. No Loading/Error State on Story Creation
**File:** `src/components/StoriesBar.tsx`
The story creation dialog state is managed but errors during creation are not surfaced clearly.

### 16. Notification `actor_profile` Join May Fail
**File:** `src/hooks/useNotifications.ts` line 36
The query uses `actor_profile:actor_id(...)` which assumes a foreign key relationship. If the actor's profile is deleted, this could return null and crash the notification display.

### 17. `CreatePost` Page Links to `/ai` (AI Assistant) but Sidebar Has No AI Link
The AI Assistant page exists in the codebase but is not in the sidebar navigation or routing, making it orphaned.

### 18. Memory Leak: Object URLs Not Revoked
**Files:** `src/pages/CreatePost.tsx`, `src/pages/Onboarding.tsx`
`URL.createObjectURL()` is called for image previews but `URL.revokeObjectURL()` is never called, causing minor memory leaks.

---

## Summary Table

| # | Severity | Issue |
|---|----------|-------|
| 1 | High | Fake online status on all users |
| 2 | Medium | Admin page client-side only guard |
| 3 | High | Share link goes to 404 |
| 4 | Medium | No delete confirmations |
| 5 | Medium | AI link goes to 404 |
| 6 | High | Confessions not truly anonymous |
| 7 | Medium | Like state can desync silently |
| 8 | Medium | No forgot password flow |
| 9 | Low | No server-side post length limit |
| 10 | Low | Duplicate source directory |
| 11 | Medium | Like/comment counts wrong at scale |
| 12 | Medium | No feed pagination |
| 13 | Low | Confession comments not anonymous |
| 14 | Low | Popular users wrong count at scale |
| 15 | Low | Story creation error handling |
| 16 | Low | Notification crash on deleted user |
| 17 | Low | Orphaned AI Assistant page |
| 18 | Low | Object URL memory leaks |

