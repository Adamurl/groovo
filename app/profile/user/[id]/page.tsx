"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import TopFiveFavoritesView from "@/app/profile/TopFiveFavoritesView";
import SavedAlbumsGrid, { SavedAlbum } from "@/app/profile/SavedAlbumsGrid";
import FollowButton from "@/app/components/FollowButton";

type Params = { id: string };
type PageProps = { params: Promise<Params> };

type PublicUser = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string | null;
  stats: {
    reviewsCount: number;
    followersCount: number;
    followingCount: number;
  };
  viewer: {
    you: string | null;
    isSelf: boolean;
    youFollow: boolean;
  };
};

type ProfilePayload = { user: PublicUser };

export default function OtherUserProfilePage({ params }: PageProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(({ id }) => {
      if (!mounted) return;
      setTargetId(id);
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/users/${targetId}`, {
          cache: "no-store",        
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const data = (await res.json()) as ProfilePayload;
        if (!res.ok) throw new Error((data as any)?.error || `HTTP ${res.status}`);
        if (!cancelled) setProfile(data.user);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load user");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <Header />
      <div className="mx-auto max-w-7xl px-6 pb-12">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading…</div>
        ) : err ? (
          <div className="py-16 text-center text-red-400">{err}</div>
        ) : !profile ? (
          <div className="py-16 text-center text-zinc-400">User not found.</div>
        ) : (
          <>
            {/* Header card */}
            <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
              <div className="flex items-start gap-4">
                <img
                  src={profile.image || "/avatar.svg"}
                  alt={profile.username ?? "avatar"}
                  className="h-16 w-16 rounded-full object-cover bg-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="text-xl font-semibold text-white truncate">
                        {profile.name || profile.username || "User"}
                      </h1>
                      <div className="text-sm text-zinc-400 truncate">
                        @{profile.username ?? profile.id.slice(0, 6)}
                      </div>
                    </div>

                    {!profile.viewer.isSelf && (
                      <FollowButton
                        targetUserId={profile.id}
                        initialFollowing={profile.viewer.youFollow}
                        initialFollowersCount={profile.stats.followersCount}
                        onChange={({ following, followersCount }) => {
                          setProfile((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  viewer: { ...prev.viewer, youFollow: following },
                                  stats: { ...prev.stats, followersCount },
                                }
                              : prev
                          );
                        }}
                      />

                    )}
                  </div>

                  {profile.bio && (
                    <p className="mt-3 text-sm text-zinc-300 whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                    <span>{profile.stats.reviewsCount} reviews</span>
                    <span>{profile.stats.followersCount} followers</span>
                    <span>{profile.stats.followingCount} following</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Top 5 (read-only for others; editable only if you are the owner) */}
            <section className="mt-8">
              <TopFiveFavoritesView
                userId={profile.id}
                title={`${profile.username ? "@" + profile.username : "User"}’s Top 5`}
                isOwner={profile.viewer.isSelf}
              />
            </section>

          </>
        )}
      </div>
    </main>
  );
}
