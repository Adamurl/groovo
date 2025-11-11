
"use client";

import { useEffect, useMemo, useState } from "react";
import { CommentItem, fetchComments, postComment } from "@/app/utils/social";
import LikeButton from "@/app/components/LikeButton";
import Link from "next/link";

function byParent(top: CommentItem[], replies: CommentItem[]) {
  const map = new Map<string, CommentItem[]>();
  replies.forEach((r) => {
    if (!r.parentId) return;
    const key = r.parentId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  });

  for (const [, arr] of map) arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  return map;
}

export default function CommentSection({
  reviewId,
  initialOpen = false,
  reviewLikeCount = 0,
  reviewInitiallyLiked = false,
  onReviewLikeChange,
}: {
  reviewId: string;
  initialOpen?: boolean;
  reviewLikeCount?: number;
  reviewInitiallyLiked?: boolean;
  onReviewLikeChange?: (liked: boolean, count: number) => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<CommentItem[]>([]);
  const [replies, setReplies] = useState<CommentItem[]>([]);
  const [newBody, setNewBody] = useState("");

  useEffect(() => {
    if (!open) return;
    let dead = false;
    setLoading(true);
    setErr(null);
    fetchComments(reviewId, 1, 20)
      .then(({ items, replies }) => {
        if (dead) return;
        setItems(items);
        setReplies(replies);
      })
      .catch((e) => !dead && setErr(e.message || "Failed to load comments"))
      .finally(() => !dead && setLoading(false));
    return () => { dead = true; };
  }, [open, reviewId]);

  const repliesByParent = useMemo(() => byParent(items, replies), [items, replies]);

  async function addTopLevel() {
    const text = newBody.trim();
    if (text.length < 1) return;
    setNewBody("");
    try {
      await postComment(reviewId, text);

      const { items, replies } = await fetchComments(reviewId, 1, 20);
      setItems(items);
      setReplies(replies);
    } catch (e) {

    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/60">
      {/* review-level actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <LikeButton
            targetType="review"
            targetId={reviewId}
            initialLiked={reviewInitiallyLiked}
            initialCount={reviewLikeCount}
            onChange={onReviewLikeChange}
          />
          <button
            className="text-sm text-zinc-200 hover:text-white"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide comments" : "Show comments"}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4">
          {loading && <div className="text-sm text-zinc-400">Loading comments…</div>}
          {err && <div className="text-sm text-red-400">{err}</div>}

          {!loading && !err && (
            <>
              {/* input */}
              <div className="mb-4 flex gap-2">
                <input
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                />
                <button
                  onClick={addTopLevel}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-500"
                >
                  Post
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-sm text-zinc-400">No comments yet.</div>
              ) : (
                <ul className="space-y-4">
                  {items.map((c) => {
                    const child = repliesByParent.get(String(c._id)) || [];
                    return (
                      <li key={String(c._id)} className="rounded-xl bg-zinc-900/70 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-zinc-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                          <LikeButton
                            targetType="comment"
                            targetId={String(c._id)}
                            initialCount={c.likeCount || 0}
                          />
                        </div>
                        <p className="mt-2 text-sm text-zinc-100 whitespace-pre-wrap">{c.body}</p>

                        {/* Quick reply */}
                        <InlineReply reviewId={reviewId} parentId={String(c._id)} onAfter={async () => {
                          const { items, replies } = await fetchComments(reviewId, 1, 20);
                          setItems(items);
                          setReplies(replies);
                        }} />

                        {child.length > 0 && (
                          <ul className="mt-3 space-y-2 border-l border-white/10 pl-3">
                            {child.map((r) => (
                              <li key={String(r._id)} className="rounded-lg bg-zinc-900/60 p-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-zinc-400">
                                    {new Date(r.createdAt).toLocaleString()}
                                  </div>
                                  <LikeButton
                                    targetType="comment"
                                    targetId={String(r._id)}
                                    initialCount={r.likeCount || 0}
                                  />
                                </div>
                                <p className="mt-1 text-sm text-zinc-100 whitespace-pre-wrap">{r.body}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InlineReply({
  reviewId,
  parentId,
  onAfter,
}: {
  reviewId: string;
  parentId: string;
  onAfter?: () => void;
}) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const text = val.trim();
    if (text.length < 1) return;
    setBusy(true);
    try {
      await postComment(reviewId, text, parentId);
      setVal("");
      onAfter?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Reply…"
        className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
      >
        Reply
      </button>
    </div>
  );
}
