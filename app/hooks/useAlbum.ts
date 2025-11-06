"use client";

import { useEffect, useState } from "react";
import type { SpotifyAlbumWithTracks } from "@/app/types/spotify";

export function useAlbum(albumId: string) {
  const [album, setAlbum] = useState<SpotifyAlbumWithTracks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/album/${albumId}`, {
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch album details");
        const data = await res.json();
        if (!canceled) setAlbum(data);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Error loading album");
      } finally {
        if (!canceled) setIsLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [albumId]);

  return { album, isLoading, error };
}
