import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE, tokenCookieOptions } from "@/lib/cookies";
import { refreshAccessToken, type SpotifyTokens } from "./spotify";

export async function setTokens(tokens: SpotifyTokens) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, JSON.stringify(tokens), tokenCookieOptions);
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function clearTokensOnResponse(response: NextResponse) {
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}

export async function getTokens(): Promise<SpotifyTokens | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

export async function hasSession(): Promise<boolean> {
  const tokens = await getTokens();
  return Boolean(tokens?.refresh_token);
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getTokens();

  if (!tokens) {
    return null;
  }

  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token;
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    await setTokens(refreshed);
    return refreshed.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}
