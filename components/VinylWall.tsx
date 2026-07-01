"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type MonthRef } from "@/lib/month-range";
import type { TopAlbum } from "@/lib/types";
import { AlbumShelf } from "./AlbumShelf";
import { ListeningConsole } from "./ListeningConsole";
import { MonthNavigator } from "./MonthNavigator";
import { ShareWallActions } from "./ShareWallActions";

type AlbumsResponse = {
  year: number;
  month: number;
  monthLabel: string;
  canGoForward: boolean;
  albums: TopAlbum[];
};

function chunkAlbums(albums: TopAlbum[]) {
  return [albums.slice(0, 3), albums.slice(3, 6), albums.slice(6, 9)];
}

export function VinylWall() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthRef | null>(null);
  const [data, setData] = useState<AlbumsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlbums = useCallback(async (month: MonthRef | null, signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = month
        ? new URLSearchParams({
            year: month.year.toString(),
            month: month.month.toString(),
          })
        : null;
      const url = params ? `/api/albums?${params.toString()}` : "/api/albums";
      const response = await fetch(url, { signal });

      if (response.status === 401) {
        throw new Error("Your Spotify session expired. Disconnect and connect again.");
      }

      if (!response.ok) {
        throw new Error("Could not load your albums");
      }

      const payload = (await response.json()) as AlbumsResponse;
      setData(payload);
      setSelectedMonth({ year: payload.year, month: payload.month });
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
    loadAlbums(selectedMonth, controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAlbums, selectedMonth]);

  function handleMonthChange(next: MonthRef) {
    setSelectedMonth(next);
  }

  const monthLabel = data?.monthLabel ?? "";
  const canGoForward = data?.canGoForward ?? false;
  const shelves = chunkAlbums(data?.albums ?? []);
  const navigatorMonth = selectedMonth ?? {
    year: data?.year ?? 0,
    month: data?.month ?? 0,
  };

  return (
    <section className="w-full">
      <div
        ref={captureRef}
        className="share-export wall-scene px-5 py-8 sm:px-10 sm:py-10"
      >
        <header className="mb-8 border-b border-[var(--border)] pb-6">
          <MonthNavigator
            year={navigatorMonth.year}
            month={navigatorMonth.month}
            monthLabel={monthLabel || "…"}
            canGoForward={canGoForward}
            disabled={loading}
            onChange={handleMonthChange}
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
            No listening history found for {data?.monthLabel ?? "this month"}.
            Try another month, or play more albums on Spotify.
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
        <ShareWallActions monthLabel={data.monthLabel} captureRef={captureRef} />
      ) : null}
    </section>
  );
}
