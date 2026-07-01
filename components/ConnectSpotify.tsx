"use client";

import { useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Spotify connection was cancelled.",
  invalid_state:
    "Login could not be verified. Use http://127.0.0.1:3000 and try connecting again.",
  auth_failed:
    "Could not connect to Spotify. On Vercel, confirm SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and that your live URL is added as a redirect URI in the Spotify dashboard.",
  config_error:
    "Spotify is not configured. Add your credentials to .env.local and restart the dev server.",
};

type ConnectSpotifyProps = {
  error?: string | null;
  appUrl: string;
};

function isLocalAppUrl(appUrl: string) {
  try {
    const { hostname } = new URL(appUrl);
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}

export function ConnectSpotify({ error, appUrl }: ConnectSpotifyProps) {
  const [connecting, setConnecting] = useState(false);
  const message = error ? ERROR_MESSAGES[error] ?? "Something went wrong." : null;
  const loginUrl = `${appUrl}/api/auth/login`;
  const isLocal = isLocalAppUrl(appUrl);

  function handleConnect() {
    setConnecting(true);
    window.location.assign(loginUrl);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#1db954]/15 ring-1 ring-[#1db954]/40">
        <svg viewBox="0 0 24 24" className="h-14 w-14 fill-[#1db954]" aria-hidden="true">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>

      <h2 className="font-serif text-3xl text-[#f5e6d0] sm:text-4xl">
        Hang your favorites on the wall
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#c9b08a]">
        Connect Spotify to see your nine most-played albums from last month,
        displayed like records mounted above the turntable.
      </p>

      {message ? (
        <p className="mt-6 rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-2 text-sm text-red-100">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#1db954] px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#1ed760] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1db954] disabled:cursor-wait disabled:opacity-80"
      >
        {connecting ? "Opening Spotify…" : "Connect Spotify"}
      </button>

      <p className="mt-6 max-w-sm text-xs leading-relaxed text-[#8f7354]">
        {isLocal ? (
          <>
            Open{" "}
            <a href={appUrl} className="underline hover:text-[#c9b08a]">
              {appUrl}
            </a>{" "}
            in Chrome or Safari if the Spotify login page does not appear.
            Cursor&apos;s built-in browser often blocks OAuth redirects.
          </>
        ) : (
          <>
            Spotify login opens in this window. If it fails, confirm your Vercel
            URL is added as a redirect URI in the Spotify Developer Dashboard.
          </>
        )}
      </p>
    </div>
  );
}
