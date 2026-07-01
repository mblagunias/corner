const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = ["user-read-recently-played"].join(" ");

export type SpotifyTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type SpotifyTrack = {
  played_at?: string;
  track: {
    id: string;
    name: string;
    album: {
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      images: Array<{ url: string; width: number; height: number }>;
      external_urls: { spotify: string };
    };
  };
};

import type { TopAlbum } from "./types";
import { getRedirectUri as buildRedirectUri } from "./app-url";
import {
  getLatestBrowsableMonth,
  getMonthRange,
  isLatestBrowsable,
} from "./month-range";

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

export function getPreviousMonthRange(referenceDate = new Date()) {
  const { year, month } = getLatestBrowsableMonth(referenceDate);
  return getMonthRange(year, month);
}

function isPlayedInRange(playedAt: Date, rangeStart: Date, rangeEnd: Date) {
  return playedAt >= rangeStart && playedAt <= rangeEnd;
}

async function fetchRecentlyPlayedInRange(
  accessToken: string,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const tracks: SpotifyTrack[] = [];
  let cursor = rangeEnd.getTime() + 1;
  const maxPages = 150;

  for (let page = 0; page < maxPages; page += 1) {
    const query = new URLSearchParams({
      limit: "50",
      before: cursor.toString(),
    });

    const data = await spotifyFetch<{
      items: SpotifyTrack[];
      cursors: { after: string | null; before: string | null };
    }>(accessToken, `/me/player/recently-played?${query.toString()}`);

    if (!data.items.length) {
      break;
    }

    let reachedBeforeRange = false;

    for (const item of data.items) {
      if (!item.played_at) {
        continue;
      }

      const playedAt = new Date(item.played_at);

      if (playedAt < rangeStart) {
        reachedBeforeRange = true;
        break;
      }

      if (!isPlayedInRange(playedAt, rangeStart, rangeEnd)) {
        continue;
      }

      tracks.push(item);
    }

    if (reachedBeforeRange) {
      break;
    }

    const lastPlayedAt = data.items.at(-1)?.played_at;
    if (!lastPlayedAt) {
      break;
    }

    const lastTimestamp = new Date(lastPlayedAt).getTime();
    if (lastTimestamp >= cursor) {
      break;
    }

    cursor = lastTimestamp;
  }

  return tracks;
}

function aggregateAlbums(tracks: Array<{ track: SpotifyTrack["track"] }>): TopAlbum[] {
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

  for (const { track } of tracks) {
    const album = track.album;
    const imageUrl = album.images[0]?.url ?? "";
    const existing = albumMap.get(album.id);

    if (existing) {
      existing.playCount += 1;
      continue;
    }

    albumMap.set(album.id, {
      id: album.id,
      name: album.name,
      artist: album.artists.map((artist) => artist.name).join(", "),
      imageUrl,
      spotifyUrl: album.external_urls.spotify,
      playCount: 1,
    });
  }

  return Array.from(albumMap.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 9);
}

export async function getTopAlbumsForMonth(
  accessToken: string,
  year: number,
  month: number,
) {
  const { start, end, label } = getMonthRange(year, month);
  const recentTracks = await fetchRecentlyPlayedInRange(accessToken, start, end);

  return {
    year,
    month,
    monthLabel: label,
    canGoForward: !isLatestBrowsable(year, month),
    albums: aggregateAlbums(recentTracks),
  };
}

export async function getTopAlbumsFromPreviousMonth(accessToken: string) {
  const { year, month } = getLatestBrowsableMonth();
  return getTopAlbumsForMonth(accessToken, year, month);
}

export async function getSpotifyProfile(accessToken: string) {
  return spotifyFetch<{ display_name: string; images: Array<{ url: string }> }>(
    accessToken,
    "/me",
  );
}
