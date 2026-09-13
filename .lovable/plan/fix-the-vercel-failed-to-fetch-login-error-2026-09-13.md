# Fix the Vercel “Failed to fetch” login error

## Confirmed findings
- The hosted authentication service is online and responding normally.
- The Vercel site loads successfully and its JavaScript contains the correct backend address.
- The Vercel JavaScript does not contain the newer connection-error guard currently in the project, indicating Vercel is serving an older build or a different GitHub branch/root directory.
- “Failed to fetch” happens before the server can validate the email or password. It means the browser could not complete the network request, not that the password is incorrect.

## Plan
1. Verify Vercel is deploying the repository’s current default branch and the project root, not the duplicate `spacehub-connect-main` folder.
2. Ensure all three public `VITE_` values are set for Vercel Production, Preview, and Development builds, then redeploy without reusing the old build cache.
3. Update the login error handling to distinguish connection failure from invalid credentials and show a clear recovery message.
4. Add a small production-safe connectivity check so login failures identify unreachable authentication instead of repeatedly retrying without explanation.
5. Test the deployed sign-in request, session refresh, sign-out, registration, and password-reset flows over HTTPS.

## Vercel settings to verify
- **Root Directory:** repository root, unless the intended app truly lives in `spacehub-connect-main`
- **Framework:** Vite
- **Build Command:** `npm run build` or the repository’s existing build command
- **Output Directory:** `dist`
- **Production Branch:** the same branch Lovable updates
- Redeploy after saving settings and environment values; Vite embeds them during the build.
