"use client";

import { useState, useEffect } from "react";

export default function Discover() {
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  // Fetch from your custom Spotify API route
  useEffect(() => {
    fetch(`/api/spotify?query=${query}`)
      .then((res) => res.json())
      .then((data) => {
        const albums = data.albums?.items || [];
        setResults(albums);
      })
      .catch((err) => console.error("Error fetching:", err));
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Discover Music</h1>

      <input
        className="border p-2 rounded-md w-full mb-4 text-White bg-gray-700"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for an artist or album..."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map((album) => (
          <div key={album.id} className="bg-gray-800 rounded-lg p-2">
            <img
              src={album.images?.[0]?.url}
              alt={album.name}
              className="rounded-md mb-2 w-full"
            />
            <h3 className="text-sm font-semibold">{album.name}</h3>
            <p className="text-xs text-gray-400">
              {album.artists?.[0]?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
