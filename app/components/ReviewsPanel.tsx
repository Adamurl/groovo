"use client";

import StarRating from "./StarRating";

export type Review = {
  id: string;
  userName: string;
  userImage?: string;
  rating: number;
  reviewText: string;
  createdAt: string;
};

export default function ReviewsPanel({
  reviews,
  title = "Reviews",
  maxHeight = "max-h-96",
}: {
  reviews: Review[];
  title?: string;
  maxHeight?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-zinc-400">{reviews.length} reviews</span>
      </div>

      <div className={`${maxHeight} overflow-y-auto space-y-3 pr-2`}>
        {reviews.map((r) => (
          <article key={r.id} className="rounded-lg bg-zinc-800/50 p-3">
            <header className="flex items-center gap-2 mb-2">
              {r.userImage ? (
                <img
                  src={r.userImage}
                  alt={`${r.userName} avatar`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-violet-400">
                    {r.userName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{r.userName}</p>
                <StarRating value={r.rating} />
              </div>
            </header>

            <p className="text-sm text-zinc-300">{r.reviewText}</p>
            <p className="text-xs text-zinc-500 mt-2">{r.createdAt}</p>
          </article>
        ))}

        {reviews.length === 0 && (
          <p className="text-sm text-zinc-400">No reviews yet.</p>
        )}
      </div>
    </section>
  );
}
