// Runtime guard: surfaces a clear error if Supabase env vars are missing
// at build time (most common cause of "Failed to fetch" auth errors in
// production deployments like Vercel where VITE_* vars weren't configured).

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const missing: string[] = [];
if (!url) missing.push("VITE_SUPABASE_URL");
if (!key) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

if (missing.length > 0) {
  const msg =
    `[Config Error] Missing required environment variables: ${missing.join(", ")}.\n` +
    `If you're seeing this on a deployed site (e.g. Vercel), add these vars in ` +
    `Project Settings → Environment Variables and redeploy. Vite only inlines ` +
    `VITE_* variables at build time.`;
  // Show a visible banner so the issue is obvious even without devtools open
  if (typeof document !== "undefined") {
    const banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;padding:12px 16px;" +
      "background:#b91c1c;color:#fff;font:14px/1.4 system-ui,sans-serif;text-align:center";
    banner.textContent = msg;
    document.addEventListener("DOMContentLoaded", () => document.body.prepend(banner));
  }
  // Also throw so the error is loud in logs
  throw new Error(msg);
}
