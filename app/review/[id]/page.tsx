"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import CommentSection from "@/app/components/CommentSection";
import Link from "next/link";
import { useParams } from "next/navigation";

// Normalized shapes coming back from the review details API
type AlbumArtist = { id?: string; name?: string } | string;
type AlbumImage = { url?: string; width?: number; height?: number };
type AlbumSnapshot = {
  name?: string;
  artists?: AlbumArtist[];
  images?: AlbumImage[];
} | null;

type ReviewAuthor = {
  id?: string;
  username?: string | null;
  name?: string | null;
  image?: string | null;
} | null;

type ReviewResponse = {
  id: string;
  userId: string;
  albumId: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  albumSnapshot?: AlbumSnapshot;
  author?: ReviewAuthor;
  viewerLiked?: boolean;
};

const PLACEHOLDER_COVER = "/placeholder-album.png";

// Format helper for a readable artist line
function formatAlbumArtists(snapshot: AlbumSnapshot): string {
  if (!snapshot?.artists || !Array.isArray(snapshot.artists) || snapshot.artists.length === 0) {
    return "Unknown Artist";
  }
  const names = snapshot.artists
    .map((artist) => {
      if (typeof artist === "string") return artist;
      return artist?.name ?? "";
    })
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
  return names.length > 0 ? names.join(", ") : "Unknown Artist";
}

// Attempt to grab a usable album art URL
function albumCover(snapshot: AlbumSnapshot): string {
  if (!snapshot?.images || !Array.isArray(snapshot.images)) return PLACEHOLDER_COVER;
  const candidate = snapshot.images.find((img) => typeof img?.url === "string" && img.url.length > 0);
  if (candidate?.url) return candidate.url;
  if (snapshot.images[0]?.url) return snapshot.images[0].url!;
  return PLACEHOLDER_COVER;
}

// Fallback album title when snapshot data is missing
function albumTitle(snapshot: AlbumSnapshot): string {
  if (!snapshot?.name || String(snapshot.name).trim().length === 0) return "Unknown album";
  return String(snapshot.name);
}

// Choose the best reviewer display name for the sidebar
function reviewerDisplayName(review: ReviewResponse | null): string {
  if (!review) return "Unknown reviewer";
  return review.author?.name ?? review.author?.username ?? "Unknown reviewer";
}

// Build an @handle style label for the reviewer
function reviewerHandle(review: ReviewResponse | null): string {
  if (!review) return "@unknown";
  if (review.author?.username) return `@${review.author.username}`;
  if (review.author?.name) return `@${review.author.name}`;
  if (review.userId) return `@${review.userId.slice(0, 6)}`;
  return "@unknown";
}

// Show an initial in the reviewer avatar circle
function reviewerInitial(review: ReviewResponse | null): string {
  const source = review?.author?.name ?? review?.author?.username ?? review?.userId ?? "U";
  return source.slice(0, 1).toUpperCase();
}

// Prefer the author id when linking to the profile page
function reviewerProfileHref(review: ReviewResponse | null): string {
  const id = review?.author?.id ?? review?.userId ?? "";
  return id ? `/profile/user/${id}` : "/profile";
}

// Localised date presentation for timestamps
function formatDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Render rating stars from a numeric score
function ratingStars(n: number) {
  const c = Math.max(0, Math.min(5, Number(n) || 0));
  const full = Math.floor(c);
  const half = Math.abs(c - full - 0.5) < 1e-6 ? 1 : c - full >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
}

// Basic pluraliser used across the header and sidebar badges so counts read naturally
function pluralize(count: number, unit: string) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return `${safe} ${safe === 1 ? unit : `${unit}s`}`;
}

export default function ReviewDetailsPage() {
  const params = useParams<{ id?: string }>();
  const reviewId = params?.id ?? "";

  // Page-level state for review payload and viewer interactions
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [viewerLiked, setViewerLiked] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  // Load review details on first render and whenever id changes
  useEffect(() => {
    if (!reviewId) {
      setError("Missing review identifier.");
      setLoading(false);
      setCommentCount(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Fetch a fresh copy of the review (no cache to stay up to date)
    fetch(`/api/reviews/${reviewId}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok || !body) {
          throw new Error(body?.error || "Failed to load review");
        }
        return body as ReviewResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setReview(data);
        setLikeCount(Number(data.likeCount ?? 0));
        setViewerLiked(!!data.viewerLiked);
        setCommentCount(Number(data.commentCount ?? 0));
      })
      .catch((e: any) => {
        if (cancelled) return;
        setReview(null);
        setError(e?.message || "Failed to load review");
        setCommentCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  // Derive display values whenever the review payload changes
  const albumSnapshot = review?.albumSnapshot ?? null;
  const albumArtists = useMemo(() => formatAlbumArtists(albumSnapshot), [albumSnapshot]);
  const albumNameValue = useMemo(() => albumTitle(albumSnapshot), [albumSnapshot]);
  const coverUrl = useMemo(() => albumCover(albumSnapshot), [albumSnapshot]);
  const createdAt = useMemo(() => formatDate(review?.createdAt), [review?.createdAt]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white">
      <Header showSearch />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row">
        <article className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg backdrop-blur">
          {/* Loading and error states */}
          {loading && (
            <div className="text-sm text-zinc-400">Loading review…</div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {!loading && !error && review && (
            <>
              {/* Review header and core metadata */}
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-violet-300">Review</span>
                <h1 className="text-3xl font-semibold tracking-tight">{albumNameValue}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span className="text-base font-semibold text-violet-300">{ratingStars(review.rating)}</span>
                  <span>Rating: {review.rating}/5</span>
                  {createdAt && (
                    <>
                      <span>•</span>
                      <span>{createdAt}</span>
                    </>
                  )}
                  <>
                    <span>•</span>
                    <span>{pluralize(likeCount, "like")}</span>
                  </>
                  {Number.isFinite(commentCount) && (
                    <>
                      <span>•</span>
                      <span>{pluralize(commentCount, "comment")}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="font-mono text-xs text-zinc-500">ID: {reviewId}</span>
                </div>
              </div>

              {/* Album snapshot pulled from the review document */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-200">Album Spotlight</h2>
                <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/30 p-4 sm:flex-row">
                  <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
                    <img
                      src={coverUrl}
                      alt={`${albumNameValue} cover art`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{albumNameValue}</h3>
                      <p className="text-sm text-zinc-400">{albumArtists}</p>
                    </div>

                    {review.albumId && (
                      <Link
                        href={`/album/${review.albumId}`}
                        className="inline-flex w-max items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800"
                      >
                        View album details
                      </Link>
                    )}
                  </div>
                </div>
              </section>

              {/* Long-form review body text */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-zinc-200">Review</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-zinc-100">
                  {review.body}
                </p>
              </section>

              {/* Social interactions: likes and threaded comments */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-zinc-200">Comments &amp; Likes</h2>
                <CommentSection
                  reviewId={review.id}
                  initialOpen
                  reviewLikeCount={likeCount}
                  reviewInitiallyLiked={viewerLiked}
                  onReviewLikeChange={(liked, nextCount) => {
                    setViewerLiked(liked);
                    setLikeCount(nextCount);
                  }}
                  onCommentCountChange={setCommentCount}
                />
              </section>
            </>
          )}
        </article>

        {!loading && !error && review && (
          // Supplementary sidebar showing reviewer info and quick stats
          <aside className="w-full max-w-sm space-y-6">
            <section className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg backdrop-blur">
              <h2 className="text-sm uppercase tracking-widest text-violet-300">Reviewer</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20 text-xl font-semibold text-violet-300">
                  {reviewerInitial(review)}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-white">
                    {reviewerDisplayName(review)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {reviewerHandle(review)}
                  </span>
                </div>
              </div>
              <Link
                href={reviewerProfileHref(review)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800"
              >
                Visit profile
              </Link>
            </section>

            <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-5 shadow">
              <h2 className="text-sm uppercase tracking-widest text-zinc-400">Review Stats</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li>Rating: {review.rating}/5</li>
                <li>{pluralize(likeCount, "like")}</li>
                <li>{pluralize(commentCount, "comment")}</li>
                {createdAt && <li>Published: {createdAt}</li>}
              </ul>
            </section>
          </aside>
        )}
      </div>
    </main>
  );
}
