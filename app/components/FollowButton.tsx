
"use client";

import { useState } from "react";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
  onChange?: (next: { following: boolean }) => void;
  className?: string;
};

export default function FollowButton({
  targetUserId,
  initialFollowing,
  onChange,
  className = "",
}: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean>(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);

    const next = !following;
    setFollowing(next);

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetUserId,
          action: next ? "follow" : "unfollow",
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || typeof j?.following !== "boolean") {
        setFollowing(!next);
        return;
      }
      setFollowing(j.following);
      onChange?.({ following: j.following });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        following ? "bg-zinc-800 text-white border border-white/10" : "bg-violet-600 text-white hover:bg-violet-500"
      } ${busy ? "opacity-60" : ""} ${className}`}
      aria-pressed={following}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
