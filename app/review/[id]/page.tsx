"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";

const mockReview = {
  id: "placeholder-review-id",
  rating: 5,
  body: `Kendrick paints a vivid coming-of-age story while switching flows effortlessly. The production is cinematic, the storytelling is razor sharp, and tracks like "Sing About Me, I'm Dying of Thirst" still hit harder than ever.`,
  createdAt: new Date().toISOString(),
  album: {
    id: "3DGQ1iZ9XKUQxAUWjfC34w",
    name: "good kid, m.A.A.d city",
    artists: ["Kendrick Lamar"],
    cover: "https://i.scdn.co/image/ab67616d00001e02d58e537cea05c2156792c53d",
  },
  reviewer: {
    id: "user-abc",
    username: "melodymaker22",
    displayName: "Melody Maker",
    image: null,
  },
};

export default function ReviewDetailsPage() {
  const params = useParams<{ id?: string }>();
  const reviewId = params?.id ?? mockReview.id;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const mockComments = [
    {
      id: "comment-1",
      author: "soundseeker44",
      body: "The storytelling on this album is wild. 'Money Trees' is my favorite track.",
      createdAt: "2 hours ago",
    },
    {
      id: "comment-2",
      author: "vinylcollector92",
      body: "Love the music video for 'Sing About Me'.",
      createdAt: "yesterday",
    },
  ];

  function toggleLike() {
    setLikeCount((count) => (liked ? Math.max(0, count - 1) : count + 1));
    setLiked(!liked);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white">
      <Header showSearch />

      {/* Page layout: main review content with an optional sidebar */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row">
        {/* Main content */}
        <article className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg backdrop-blur">
          {/* Review summary block */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-violet-300">
              Review
            </span>
            <h1 className="text-3xl font-semibold tracking-tight">
              {mockReview.album.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span>Rating: {mockReview.rating}/5</span>
              <span>•</span>
              <span>
                {new Date(mockReview.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="font-mono text-xs text-zinc-500">
                ID: {reviewId}
              </span>
            </div>
          </div>

          {/* Album details placeholder */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">
              Album Spotlight
            </h2>

            <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/30 p-4 sm:flex-row">
              <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
                <img
                  src={mockReview.album.cover}
                  alt={`${mockReview.album.name} cover art`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {mockReview.album.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {mockReview.album.artists.join(", ")}
                  </p>
                </div>

                <Link
                  href={`/album/${mockReview.album.id}`}
                  className="inline-flex w-max items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 transition"
                >
                  View album details
                </Link>
              </div>
            </div>
          </section>

          {/* Review body placeholder */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">
              Review:
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-zinc-100">
              {mockReview.body}
            </p>
          </section>

          {/* Future interactions placeholder */}
          <section className="space-y-4 rounded-2xl border border-white/5 bg-black/20 p-5">
            <h2 className="text-lg font-semibold text-zinc-200">
              Comments & Likes
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLike}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  liked
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                }`}
              >
                {liked ? "Unlike" : "Like"}
              </button>
              <span className="text-sm text-zinc-400">
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </span>
            </div>
            <div className="space-y-3">
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/5 bg-black/10 p-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>@{comment.author}</span>
                    <span>{comment.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{comment.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Mock comments and likes. We will implement this later.
            </p>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="w-full max-w-sm space-y-6">
          {/* Reviewer card */}
          <section className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg backdrop-blur">
            <h2 className="text-sm uppercase tracking-widest text-violet-300">
              Reviewer
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20 text-xl font-semibold text-violet-300">
                {(mockReview.reviewer.displayName ?? "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium text-white">
                  {mockReview.reviewer.displayName}
                </span>
                <span className="text-sm text-zinc-400">
                  @{mockReview.reviewer.username}
                </span>
              </div>
            </div>
            <Link
              href={`/profile/${mockReview.reviewer.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 transition"
            >
              Visit profile
            </Link>
          </section>

          {/* Roadmap reminder */}
          <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-5 shadow">
            <h2 className="text-sm uppercase tracking-widest text-zinc-400">
              Page Roadmap
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>• Replace mock data with live API response</li>
              <li>• Integrate comments feed and reactions</li>
              <li>• Show related reviews or album activity maybe?</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

