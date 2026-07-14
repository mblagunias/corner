"use client";

import type { TopAlbum } from "@/lib/types";

type AlbumCoverProps = {
  album: TopAlbum;
};

export function AlbumCover({ album }: AlbumCoverProps) {
  return (
    <a
      href={album.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="album-cover group"
      aria-label={`Open ${album.name} by ${album.artist} on Spotify`}
    >
      <div className="album-cover-art">
        {album.imageUrl ? (
          <img
            src={album.imageUrl}
            alt={`${album.name} cover art`}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[0.625rem] text-[var(--text-muted)]">
            No cover
          </div>
        )}
        <div className="album-cover-meta">
          <p className="album-cover-title">{album.name}</p>
          <p className="album-cover-artist">{album.artist}</p>
        </div>
      </div>
    </a>
  );
}

export function AlbumCoverPlaceholder() {
  return (
    <div className="album-cover" aria-hidden="true">
      <div className="album-cover-placeholder" />
    </div>
  );
}
