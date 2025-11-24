"use client";

import { useEffect, useState } from "react";

export function useEventsbyArtist(artists: string[], location: string = "") {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artists || artists.length === 0) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/events/by-artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artists, location }),
        });

        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [artists, location]);

  return { events, loading };
}