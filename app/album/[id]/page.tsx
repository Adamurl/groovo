"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import CompactTracklist from "../../components/CompactTracklist";
import ReviewsPanel, { Review } from "../../components/ReviewsPanel";
import ReviewDialog from "../../components/ReviewDialog";
import { formatAlbumDate } from "../../utils/date";
import { SpotifyAlbumWithTracks } from "@/app/types/spotify";

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const router = useRouter();
  const [album, setAlbum] = useState<SpotifyAlbumWithTracks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);

  // reviews (client-only for now)
  const [reviews, setReviews] = useState<Review[]>([
    { id: "1", userName: "musiclover23", rating: 5, reviewText: "This album is absolutely incredible. Every track is a masterpiece and the production quality is outstanding.", createdAt: "2024-01-15" },
    { id: "2", userName: "vinylcollector", rating: 4, reviewText: "Solid album with great vibes. Some tracks really stand out, though there are a few weaker moments.", createdAt: "2024-01-10" },
    { id: "3", userName: "soundexplorer", rating: 5, reviewText: "A timeless classic. The artist really delivered on this one. Perfect for late-night listening.", createdAt: "2024-01-05" },
  ]);

  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setAlbumId(id));
  }, [params]);

  useEffect(() => {
    if (!albumId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/album/${albumId}`);
        if (!res.ok) throw new Error("Failed to fetch album");
        const data = await res.json();
        setAlbum(data);
      } catch (e: any) {
        setError(e.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <Header />
        {/* skeleton... */}
      </main>
    );
  }

  if (error || !album) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <Header />
        {/* error UI... */}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0">
            <img
              src={album.images[0]?.url || "/placeholder-album.png"}
              alt={album.name}
              className="w-full md:w-80 rounded-lg shadow-2xl"
            />
          </div>

          <div className="flex-1">
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

            {/* CTAs */}
            <div className="flex gap-4">
              <a
                href={album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-6 py-3 text-sm font-medium text-white hover:bg-violet-600 transition"
              >
                Play on Spotify
              </a>

              <button
                onClick={() => setIsReviewOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition"
              >
                Review Album
              </button>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CompactTracklist
            tracks={album.tracks.items}
            total={album.tracks.total}
            limit={12}
          />
          <ReviewsPanel reviews={reviews} />
        </div>
      </div>

      {/* Review Modal */}
      <ReviewDialog
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        albumName={album.name}
        onSubmit={({ rating, reviewText }) => {
          // TODO: replace with POST to your reviews API later
          setReviews((prev) => [
            {
              id: String(Date.now()),
              userName: "You",
              rating,
              reviewText,
              createdAt: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ]);
          setIsReviewOpen(false);
        }}
      />
    </main>
  );
}
