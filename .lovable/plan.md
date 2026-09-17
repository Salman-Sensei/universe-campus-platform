# Add Smart Feed Ranking + NSFW Image Detection, then deploy to Vercel

## What exists today (confirmed)
- `ai-assistant` edge function: the student chatbot.
- `moderate-confession` edge function: screens confession text before publishing.
- Landing page advertises "Smart ranking" but the feed is actually newest-first — the ranking was never built.
- No image safety check exists anywhere; posts, stories, marketplace photos, and avatars upload unchecked.

## What you'll get

1. **Smart feed ranking**
   - Feed posts get a relevance score instead of pure newest-first ordering.
   - Score combines: recency, likes/comments, whether you follow the author, and overlap with your subjects/interests.
   - Done in the feed query logic (`src/hooks/usePosts.ts`) with a lightweight server-side scoring function — no expensive per-user AI calls on every page load.
   - Landing page "Smart ranking" claim becomes true.

2. **NSFW image detection**
   - New edge function `moderate-image`: sends an uploaded image to the AI and returns safe/unsafe with a reason.
   - Wired into every upload path: post images, story images, marketplace listing photos, avatars/banners.
   - If an image is flagged: upload is blocked, the user sees a clear message ("This image can't be uploaded"), nothing is stored publicly.
   - Fail-safe behavior: if the AI check itself errors, the upload is blocked and the user is asked to try again (safer default for a campus app).
   - Gateway errors handled per contract: 429/5xx retried once with backoff; 402/403 surfaced clearly, no retry loops.

3. **Vercel deployment (you confirmed: go with Vercel)**
   - Fix the current broken deploy: the live site 404s because Vercel's Root Directory points at the old `spacehub-connect-main` folder.
   - I will verify the repo structure and `vercel.json` SPA rewrites are correct.
   - You then do the Vercel-side steps (I can't access your Vercel account): set Root Directory to the repository root, confirm the 3 env vars, redeploy without build cache.

## Technical details
- New edge function: `supabase/functions/moderate-image/index.ts` — image_url input via Lovable AI vision (multimodal chat completion), zod-validated input, CORS headers, strict JSON verdict.
- Feed scoring: SQL function `post_feed_score` (recency decay + engagement + follow boost + subject match) or computed in `usePosts.ts` after fetching follows/subjects; no new tables needed.
- Client changes: `CreatePost.tsx`, `CreateStoryDialog.tsx`, Marketplace listing form, avatar/banner upload call the moderation function before upload; blocked state shows a toast and keeps user input.
- Verification: `bunx tsgo --noEmit`, vitest, plus Playwright checks of feed ordering and a test image upload.

## Cost note
NSFW checks call the AI once per image upload — billed per request from your Lovable AI credits (free monthly allowance first). Feed ranking adds no AI cost.
