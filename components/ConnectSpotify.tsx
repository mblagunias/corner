"use client";

import { useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Spotify connection was cancelled.",
  invalid_state:
    "Login could not be verified. Use http://127.0.0.1:3000 and try connecting again.",
  auth_failed:
    "Could not connect to Spotify. On Vercel, confirm SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and that your live URL is added as a redirect URI in the Spotify dashboard.",
  config_error:
    "Spotify is not configured on the server. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Vercel, then redeploy.",
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
    <div className="mx-auto flex max-w-md flex-col">
      <h2 className="text-lg font-medium tracking-tight text-[var(--text)] sm:text-xl">
        Connect Spotify
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        Your nine top albums from Spotify for the previous month, arranged on
        three shelves above a listening console.
      </p>

      {message ? (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className="mt-8 inline-flex w-fit items-center border border-[var(--text)] bg-[var(--text)] px-6 py-2.5 text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--surface-raised)] transition hover:bg-transparent hover:text-[var(--text)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] disabled:cursor-wait disabled:opacity-60"
      >
        {connecting ? "Connecting…" : "Connect Spotify"}
      </button>

      <p className="mt-8 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
        {isLocal ? (
          <>
            Open{" "}
            <a href={appUrl} className="underline underline-offset-2 hover:text-[var(--text)]">
              {appUrl}
            </a>{" "}
            in Chrome or Safari. Cursor&apos;s built-in browser often blocks
            OAuth redirects.
          </>
        ) : (
          <>
            If login fails, confirm your Vercel URL is registered as a redirect
            URI in the Spotify Developer Dashboard.
          </>
        )}
      </p>
    </div>
  );
}
