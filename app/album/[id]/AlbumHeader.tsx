"use client";

import { useRouter } from "next/navigation";
import { formatAlbumDate } from "@/app/utils/date";
import type { SpotifyAlbumWithTracks } from "@/app/types/spotify";

export default function AlbumHeader({ album }: { album: SpotifyAlbumWithTracks }) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      <div className="flex-shrink-0">
        <img
          src={album.images[0]?.url || "/placeholder-album.png"}
          alt={album.name}
          className="w-full md:w-80 rounded-lg shadow-2xl"
        />
      </div>

      <div className="flex-1">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.name}</h1>
        <p className="text-xl text-zinc-300 mb-6">
          {album.artists.map((a) => a.name).join(", ")}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-6">
          <span>{formatAlbumDate(album.release_date, album.release_date_precision)}</span>
          <span>•</span>
          <span>{album.total_tracks} tracks</span>
          {album.genres.length > 0 && (
            <>
              <span>•</span>
              <span>{album.genres.slice(0, 3).join(", ")}</span>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <a
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-6 py-3 text-sm font-medium text-white hover:bg-violet-600 transition"
          >
            Play on Spotify
          </a>
        </div>
      </div>
    </div>
  );
}
