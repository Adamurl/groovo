"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import AlbumHeader from "./AlbumHeader";
import ReviewSection from "./ReviewSection";
import CompactTracklist from "../../components/CompactTracklist";
import { useAlbum } from "../../hooks/useAlbum";

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const [albumId, setAlbumId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setAlbumId(id));
  }, [params]);

  const { album, isLoading, error } = useAlbum(albumId ?? "");

  if (!albumId) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-8">
        {isLoading && <div className="text-zinc-400 py-10">Loading album…</div>}
        {error && !isLoading && <div className="text-red-400 py-10">{error}</div>}

        {album && (
          <>
            {/* Top Row: AlbumHeader + Tracklist side-by-side */}
            <div className="grid grid-cols-[1fr_0.4fr] gap-6 items-start">
              <div className="w-full">
                <AlbumHeader album={album} />
              </div>
              <div className="w-full max-w-sm">
                <CompactTracklist
                  tracks={album.tracks.items}
                  total={album.tracks.total}
                  limit={30}
                />
              </div>
            </div>

            {/* Bottom: Full-width ReviewSection */}
            <div className="w-full">
              <ReviewSection albumId={albumId} album={album} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
