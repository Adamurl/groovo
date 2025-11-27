"use client";

import { useState } from "react";
import { saveAlbumToLibrary, SaveAlbumPayload } from "@/app/utils/library";

export function useLibraryEntry(initialInLibrary = false) {
  const [inLibrary, setInLibrary] = useState(initialInLibrary);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addToLibrary = async (payload: SaveAlbumPayload) => {
    if (loading || inLibrary) return; // one-way for now (only add)

    setLoading(true);
    setInLibrary(true); // optimistic
    setMessage("Adding to your library...");

    try {
      const result = await saveAlbumToLibrary(payload);

      if (result.ok) {
        setMessage("Added to your library!");
      } else {
        setInLibrary(false);
        setMessage(result.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setInLibrary(false);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    inLibrary,
    loading,
    message,
    addToLibrary,
  };
}
