// Runtime guard: if the backend settings were not included when the site was
// built (e.g. missing VITE_* vars on Vercel), show a calm "unavailable" page
// instead of a broken app. Vite only inlines VITE_* variables at build time.

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const missing: string[] = [];
if (!url) missing.push("VITE_SUPABASE_URL");
if (!key) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

if (missing.length > 0) {
  const msg = `[Config Error] Missing environment variables: ${missing.join(", ")}. Add them in your hosting settings and redeploy.`;
  console.error(msg);

  if (typeof document !== "undefined") {
    const render = () => {
      const root = document.getElementById("root") ?? document.body;
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#071216;color:#F0FDFA;font-family:'DM Sans',system-ui,sans-serif">
          <div style="max-width:420px;text-align:center">
            <h1 style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:24px;margin:0 0 12px">UniVerse is temporarily unavailable</h1>
            <p style="margin:0 0 20px;color:#A7C4C9;line-height:1.5">We're finishing an update. Please check back in a few minutes.</p>
            <button onclick="location.reload()" style="background:#06B6D4;color:#071216;border:0;border-radius:8px;padding:10px 18px;font-weight:600;cursor:pointer">Try again</button>
          </div>
        </div>`;
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
    else render();
  }

  throw new Error(msg);
}
