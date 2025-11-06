"use client";

import { useEffect, useMemo, useState } from "react";
import StarInput from "./StarInput";
import {
  buildAlbumSnapshotForDb,
  postReview,
  PostReviewResult,
} from "./../utils/reviews";

/**
 * ReviewDialog
 * - Modal for writing a review for a specific album.
 * - Uses utils/reviews.ts helpers for payload shaping and POST.
 */
export default function ReviewDialog({
  open,
  onClose,
  albumId,
  albumName,
  albumSnapshot,         // raw Spotify album object (we'll map it)
  onSuccess,             // callback with new review id
}: {
  open: boolean;
  onClose: () => void;
  albumId: string;
  albumName?: string;
  albumSnapshot?: unknown;
  onSuccess?: (newReviewId: string) => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map the raw Spotify album to the schema your API expects
  const mappedSnapshot = useMemo(
    () => buildAlbumSnapshotForDb(albumSnapshot as any),
    [albumSnapshot]
  );

  // Reset form each time the dialog opens
  useEffect(() => {
    if (open) {
      setRating(0);
      setText("");
      setErrorMsg(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit() {
    if (rating < 1) return setErrorMsg("Please select a rating.");
    if (text.trim().length < 10)
      return setErrorMsg("Review must be at least 10 characters.");

    setBusy(true);
    setErrorMsg(null);

    const result: PostReviewResult = await postReview({
      albumId,
      rating,
      body: text.trim(),
      album: mappedSnapshot, // { name, artists[] } | null
    });

    setBusy(false);

    if (!result.ok) {
      if (result.status === 401) return setErrorMsg("You must be logged in to post a review.");
      if (result.status === 409) return setErrorMsg("You already reviewed this album.");
      return setErrorMsg(result.message);
    }

    onSuccess?.(result.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <button
        aria-label="Close review dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
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
          {/* Rating */}
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          {/* Textarea */}
          <div>
            <label htmlFor="review-text" className="mb-1 block text-sm text-zinc-300">
              Your review
            </label>
            <textarea
              id="review-text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="What stood out? Favorite tracks? Production, lyrics, vibes?"
              className="w-full resize-y rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500"
            />
            <div className="mt-1 text-xs text-zinc-500">{text.length}/1000</div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}
