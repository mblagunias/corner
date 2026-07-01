function normalizeAppUrl(url: string) {
  return url.replace(/\/$/, "");
}

function firstHeaderValue(value: string | null, fallback = "") {
  if (!value) {
    return fallback;
  }

  return value.split(",")[0].trim();
}

function buildAppUrl(protocol: string, host: string) {
  const normalizedProtocol = protocol.replace(/:$/, "");
  return normalizeAppUrl(`${normalizedProtocol}://${host}`);
}

export function getAppUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  return "http://127.0.0.1:3000";
}

export function getAppUrlFromRequest(request: {
  nextUrl: URL;
  headers: Headers;
}) {
  const host = firstHeaderValue(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  const protocol = firstHeaderValue(
    request.headers.get("x-forwarded-proto"),
    request.nextUrl.protocol.replace(":", ""),
  );

  if (host) {
    return buildAppUrl(protocol, host);
  }

  return normalizeAppUrl(`${request.nextUrl.protocol}//${request.nextUrl.host}`);
}

export async function getAppUrlFromHeaders(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const host = firstHeaderValue(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
  );
  const protocol = firstHeaderValue(
    headerStore.get("x-forwarded-proto"),
    "https",
  );

  if (host) {
    return buildAppUrl(protocol, host);
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
