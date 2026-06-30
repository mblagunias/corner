"use client";

import type { TopAlbum } from "@/lib/types";

const TILTS = [-2.5, 1.8, -1.2, 2.1, -1.6, 0.8, -2.2, 1.4, -0.6];

type VinylRecordProps = {
  album: TopAlbum;
  index: number;
};

export function VinylRecord({ album, index }: VinylRecordProps) {
  const tilt = TILTS[index % TILTS.length];

  return (
    <a
      href={album.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="vinyl-record group relative block aspect-square w-full max-w-[220px] justify-self-center transition-transform duration-300 hover:z-10 hover:scale-[1.04]"
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label={`Open ${album.name} by ${album.artist} on Spotify`}
    >
      <div className="vinyl-nail" aria-hidden="true" />

      <div className="relative h-full w-full">
        <div className="vinyl-disc" aria-hidden="true">
          <div className="vinyl-disc-grooves" />
          <div className="vinyl-disc-label" />
        </div>

        <div className="vinyl-sleeve relative z-10 h-full w-full overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-shadow duration-300 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.55)]">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={`${album.name} cover art`}
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-sm text-neutral-300">
              No cover
            </div>
          )}
          <div className="vinyl-sleeve-shine" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 text-center opacity-90 transition-opacity group-hover:opacity-100">
        <p className="truncate text-sm font-medium text-[#f5e6d0]">{album.name}</p>
        <p className="truncate text-xs text-[#c9b08a]">{album.artist}</p>
      </div>
    </a>
  );
}
