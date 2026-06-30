"use client";

import { useEffect, useRef, useState } from "react";
import type { TopAlbum } from "@/lib/types";
import { ShareWallActions } from "./ShareWallActions";
import { VinylRecord } from "./VinylRecord";

type AlbumsResponse = {
  monthLabel: string;
  albums: TopAlbum[];
};

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
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="loading-vinyl" aria-label="Loading albums" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-center text-red-100">
        {error}
      </p>
    );
  }

  if (!data?.albums.length) {
    return (
      <p className="rounded-xl border border-[#5c4a35]/50 bg-[#2a2118]/60 px-4 py-6 text-center text-[#d9c5a4]">
        No listening history found for {data?.monthLabel ?? "last month"}. Play
        some albums on Spotify and check back.
      </p>
    );
  }

  const placeholders = Array.from({ length: Math.max(0, 9 - data.albums.length) });

  return (
    <section className="w-full">
      <div ref={captureRef} className="share-export vinyl-room rounded-2xl px-6 py-10 sm:px-10">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#a88d67]">
            Your wall
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#f5e6d0] sm:text-4xl">
            Top albums · {data.monthLabel}
          </h2>
          <p className="mt-3 text-sm text-[#c9b08a]">
            Ranked by how often you played them last month
          </p>
        </header>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {data.albums.map((album, index) => (
            <VinylRecord key={album.id} album={album} index={index} />
          ))}
          {placeholders.map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="aspect-square w-full max-w-[220px] justify-self-center rounded-sm border border-dashed border-[#5c4a35]/40 bg-[#1f1812]/40"
              aria-hidden="true"
            />
          ))}
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.35em] text-[#8f7354]">
          Vinyl Wall · Corner
        </p>
      </div>

      <ShareWallActions monthLabel={data.monthLabel} captureRef={captureRef} />
    </section>
  );
}
