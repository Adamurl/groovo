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

  if(!albumId) return null;
 
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-6">
        {isLoading && (
          <div className="text-zinc-400 py-10">Loading album…</div>
        )}

        {error && !isLoading && (
          <div className="text-red-400 py-10">{error}</div>
        )}

        {album && (
          <>
            <AlbumHeader album={album} />
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <CompactTracklist
                tracks={album.tracks.items}
                total={album.tracks.total}
                limit={30}
              />
              <ReviewSection albumId={albumId} album={album} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
