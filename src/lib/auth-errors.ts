const NETWORK_ERROR_PATTERN = /failed to fetch|fetch failed|networkerror|authretryablefetcherror/i;

export function isAuthNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return NETWORK_ERROR_PATTERN.test(`${error.name} ${error.message}`);
  }

  return typeof error === "string" && NETWORK_ERROR_PATTERN.test(error);
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAuthNetworkError(error)) {
    return "Unable to reach the login service. Check your internet connection and try again. If this continues, the deployed app needs to be updated in Vercel.";
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

export async function checkAuthConnection(): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return false;

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}