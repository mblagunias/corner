"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TopAlbum } from "@/lib/types";
import {
  getDefaultTimeRange,
  getTimeRangeLabel,
  type TimeRange,
} from "@/lib/time-range";
import { AlbumShelf } from "./AlbumShelf";
import { ListeningConsole } from "./ListeningConsole";
import { ShareWallActions } from "./ShareWallActions";
import { TimeRangeNavigator } from "./TimeRangeNavigator";

type AlbumsResponse = {
  timeRange: TimeRange;
  periodLabel: string;
  canGoForward: boolean;
  canGoBack: boolean;
  albums: TopAlbum[];
};

function chunkAlbums(albums: TopAlbum[]) {
  return [albums.slice(0, 3), albums.slice(3, 6), albums.slice(6, 9)];
}

export function VinylWall() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(getDefaultTimeRange);
  const [data, setData] = useState<AlbumsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlbums = useCallback(async (timeRange: TimeRange, signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ time_range: timeRange });
      const response = await fetch(`/api/albums?${params.toString()}`, {
        signal,
      });

      if (response.status === 401) {
        throw new Error("Your Spotify session expired. Disconnect and connect again.");
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Could not load your albums");
      }

      const payload = (await response.json()) as AlbumsResponse;
      setData(payload);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong",
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadAlbums(selectedRange, controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAlbums, selectedRange]);

  const periodLabel = data?.periodLabel ?? getTimeRangeLabel(selectedRange);
  const shelves = chunkAlbums(data?.albums ?? []);

  return (
    <section className="w-full">
      <div
        ref={captureRef}
        className="share-export wall-scene px-5 py-8 sm:px-10 sm:py-10"
      >
        <header className="mb-8 border-b border-[var(--border)] pb-6">
          <TimeRangeNavigator
            timeRange={selectedRange}
            periodLabel={loading && !data ? "…" : periodLabel}
            disabled={loading}
            onChange={setSelectedRange}
          />
        </header>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="loading-indicator" aria-label="Loading albums" />
          </div>
        ) : error ? (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
            {error}
          </p>
        ) : !data?.albums.length ? (
          <p className="border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No top albums found for {periodLabel.toLowerCase()}. Play more
            albums on Spotify, or try another time range.
          </p>
        ) : (
          <div className="flex flex-col gap-8 sm:gap-10">
            {shelves.map((row, index) => (
              <AlbumShelf key={`shelf-${index}`} albums={row} />
            ))}
          </div>
        )}

        {!loading && !error ? <ListeningConsole /> : null}
      </div>

      {!loading && !error && data?.albums.length ? (
        <ShareWallActions periodLabel={data.periodLabel} captureRef={captureRef} />
      ) : null}
    </section>
  );
}
