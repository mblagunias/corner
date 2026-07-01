import type { TopAlbum } from "@/lib/types";
import { AlbumCover, AlbumCoverPlaceholder } from "./AlbumCover";

type AlbumShelfProps = {
  albums: TopAlbum[];
};

export function AlbumShelf({ albums }: AlbumShelfProps) {
  const slots = Array.from({ length: 3 }, (_, index) => albums[index] ?? null);

  return (
    <div className="album-shelf">
      <div className="album-shelf-albums">
        {slots.map((album, index) =>
          album ? (
            <AlbumCover key={album.id} album={album} />
          ) : (
            <AlbumCoverPlaceholder key={`empty-${index}`} />
          ),
        )}
      </div>
      <div className="album-shelf-board" aria-hidden="true" />
    </div>
  );
}
