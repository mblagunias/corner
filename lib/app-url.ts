function normalizeAppUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://127.0.0.1:3000";
}

export function getAppUrlFromRequest(request: { nextUrl: URL }): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  return normalizeAppUrl(`${request.nextUrl.protocol}//${request.nextUrl.host}`);
}

export async function getAppUrlFromHeaders(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    return normalizeAppUrl(`${protocol}://${host}`);
  }

  return getAppUrl();
}

export function getRedirectUri(appUrl: string) {
  return `${normalizeAppUrl(appUrl)}/api/auth/callback`;
}

export function isLocalAppUrl(appUrl: string) {
  try {
    const { hostname } = new URL(appUrl);
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}
