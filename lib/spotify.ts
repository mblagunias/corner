const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = ["user-top-read"].join(" ");

export type SpotifyTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type SpotifyTopTrack = {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    album_type?: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string; width: number; height: number }>;
    external_urls: { spotify: string };
  };
};

import type { TopAlbum } from "./types";
import { getRedirectUri as buildRedirectUri } from "./app-url";
import {
  getDefaultTimeRange,
  getTimeRangeLabel,
  type TimeRange,
} from "./time-range";

export type { TopAlbum };

export function hasSpotifyConfig() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
  );
}

function getCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  return { clientId, clientSecret };
}

export function getRedirectUri(appUrl?: string) {
  if (appUrl) {
    return buildRedirectUri(appUrl);
  }

  return buildRedirectUri(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://127.0.0.1:3000"),
  );
}

export function getLoginUrl(state: string, appUrl?: string) {
  const { clientId } = getCredentials();
  const redirectUri = getRedirectUri(appUrl);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: "true",
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  appUrl?: string,
): Promise<SpotifyTokens> {
  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(appUrl),
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to exchange authorization code");
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

async function spotifyFetch<T>(accessToken: string, path: string): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return response.json();
}

async function fetchTopTracks(accessToken: string, timeRange: TimeRange) {
  const query = new URLSearchParams({
    limit: "50",
    time_range: timeRange,
  });

  const data = await spotifyFetch<{ items: SpotifyTopTrack[] }>(
    accessToken,
    `/me/top/tracks?${query.toString()}`,
  );

  return data.items ?? [];
}

function aggregateAlbumsFromTopTracks(tracks: SpotifyTopTrack[]): TopAlbum[] {
  const albumMap = new Map<
    string,
    {
      id: string;
      name: string;
      artist: string;
      imageUrl: string;
      spotifyUrl: string;
      playCount: number;
    }
  >();

  for (const track of tracks) {
    const album = track?.album;
    if (!album?.id) {
      continue;
    }

    // Prefer full albums / compilations for a vinyl wall; skip singles.
    if (album.album_type === "single") {
      continue;
    }

    const imageUrl = album.images?.[0]?.url ?? "";
    const existing = albumMap.get(album.id);

    if (existing) {
      existing.playCount += 1;
      continue;
    }

    albumMap.set(album.id, {
      id: album.id,
      name: album.name ?? "Unknown album",
      artist:
        album.artists?.map((artist) => artist.name).join(", ") ??
        "Unknown artist",
      imageUrl,
      spotifyUrl: album.external_urls?.spotify ?? "",
      playCount: 1,
    });
  }

  return Array.from(albumMap.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 9);
}

export async function getTopAlbumsForTimeRange(
  accessToken: string,
  timeRange: TimeRange = getDefaultTimeRange(),
) {
  const topTracks = await fetchTopTracks(accessToken, timeRange);

  return {
    timeRange,
    periodLabel: getTimeRangeLabel(timeRange),
    canGoForward: false,
    canGoBack: false,
    albums: aggregateAlbumsFromTopTracks(topTracks),
  };
}

export async function getSpotifyProfile(accessToken: string) {
  return spotifyFetch<{ display_name: string; images: Array<{ url: string }> }>(
    accessToken,
    "/me",
  );
}
