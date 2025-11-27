"use client";

import { useState } from "react";
import { useLibrary, LibraryAlbum } from "../hooks/useLibrary";

type AddToLibraryButtonProps = {
  albumId: string;
  title: string;
  coverUrl?: string;
  artists?: string[];
  className?: string;
};

export default function AddToLibraryButton({
  albumId,
  title,
  coverUrl,
  artists,
  className = "",
}: AddToLibraryButtonProps) {
  const { isSaved, add, remove } = useLibrary();
  const saved = isSaved(albumId);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    if (busy) return;

    setBusy(true);
    setMessage(null);

    if (saved) {
      // Optimistic remove via context
      remove(albumId);
      setMessage("Removed from your library.");
      setBusy(false); // remove is already optimistic in useLibrary
    } else {
      const payload: LibraryAlbum = {
        id: albumId,
        title,
        coverUrl,
        artists,
      };
      add(payload); // useLibrary does optimistic add + POST /api/library

      setMessage("Added to your library!");
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium border border-white/10 transition ${
          saved
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        } disabled:opacity-60`}
      >
        <span>{saved ? "✓ In your library" : "+ Add to library"}</span>
      </button>

      {message && (
        <span className="text-xs text-zinc-400">
          {message}
        </span>
      )}
    </div>
  );
}
