"use client";

import { useEffect, useRef, useState } from "react";
import type { TopAlbum } from "@/lib/types";
import { AlbumShelf } from "./AlbumShelf";
import { ListeningConsole } from "./ListeningConsole";
import { ShareWallActions } from "./ShareWallActions";

type AlbumsResponse = {
  monthLabel: string;
  albums: TopAlbum[];
};

function chunkAlbums(albums: TopAlbum[]) {
  return [
    albums.slice(0, 3),
    albums.slice(3, 6),
    albums.slice(6, 9),
  ];
}

export function VinylWall() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AlbumsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      try {
        const response = await fetch("/api/albums");

        if (response.status === 401) {
          throw new Error("Your Spotify session expired. Disconnect and connect again.");
        }

        if (!response.ok) {
          throw new Error("Could not load your albums");
        }

        const payload = (await response.json()) as AlbumsResponse;

        if (!cancelled) {
          setData(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Something went wrong",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="loading-indicator" aria-label="Loading albums" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data?.albums.length) {
    return (
      <p className="border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
        No listening history found for {data?.monthLabel ?? "last month"}. Play
        some albums on Spotify and check back.
      </p>
    );
  }

  const shelves = chunkAlbums(data.albums);

  return (
    <section className="w-full">
      <div
        ref={captureRef}
        className="share-export wall-scene px-5 py-8 sm:px-10 sm:py-10"
      >
        <header className="mb-8 border-b border-[var(--border)] pb-6">
          <p className="text-[0.625rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Top albums
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-tight text-[var(--text)] sm:text-xl">
            {data.monthLabel}
          </h2>
        </header>

        <div className="flex flex-col gap-8 sm:gap-10">
          {shelves.map((row, index) => (
            <AlbumShelf key={`shelf-${index}`} albums={row} />
          ))}
        </div>

        <ListeningConsole />
      </div>

      <ShareWallActions monthLabel={data.monthLabel} captureRef={captureRef} />
    </section>
  );
}
