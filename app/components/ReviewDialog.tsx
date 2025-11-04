"use client";

import { useEffect, useState } from "react";
import StarInput from "./StarInput";

export default function ReviewDialog({
  open,
  onClose,
  onSubmit,
  albumName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; reviewText: string }) => void;
  albumName?: string;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRating(0);
      setText("");
      setErr(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (rating < 1) return setErr("Please select a rating.");
    if (text.trim().length < 10)
      return setErr("Review must be at least 10 characters.");
    setSubmitting(true);
    try {
      onSubmit({ rating, reviewText: text.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Review {albumName ? `“${albumName}”` : "album"}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Share your thoughts and rate the album.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label htmlFor="review" className="mb-1 block text-sm text-zinc-300">
              Your review
            </label>
            <textarea
              id="review"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What stood out to you? Favorite tracks? Production, lyrics, vibes?"
              className="w-full resize-y rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500"
            />
            <div className="mt-1 text-xs text-zinc-500">
              {text.length}/1000
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}
