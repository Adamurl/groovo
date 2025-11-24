"use client";

import { useState } from "react";
import Header from "../components/Header";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserReviews } from "../hooks/useUserReviews";
import { useEventsbyArtist } from "../hooks/useEventsbyArtist";
import ArtistEventsSection from "./ArtistEventsSection";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EventsPage() {
  const router = useRouter();

  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { items: reviews } = useUserReviews(currentUser?._id ?? null);

  // New state for filtering
  const [location, setLocation] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !currentUser) {
      router.replace("/login");
    }
  }, [isUserLoading, currentUser, router]);

  // Extract artists
  const artistNames = useMemo(() => {
    if (!reviews) return [];
    const names = [];

    for (const r of reviews) {
      const snap = r.albumSnapshot ?? r.album ?? {};
      if (Array.isArray(snap.artists)) {
        for (const a of snap.artists) if (a?.name) names.push(a.name);
      }
    }

    return [...new Set(names)];
  }, [reviews]);

  // Events (auto-sorted by date)
  const { events, loading: eventsLoading } = useEventsbyArtist(
    artistNames,
    location
  );

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h1 className="text-3xl font-semibold mt-8">Upcoming Events</h1>
        <p className="text-zinc-400 mb-6">
          Events from artists whose albums you've reviewed.
        </p>

        {/* Location Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter by location (city, state, country)…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {eventsLoading ? (
          <p className="text-zinc-500">Loading events…</p>
        ) : (
          <ArtistEventsSection events={events} />
        )}
      </div>
    </main>
  );
}
