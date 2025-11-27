export type SaveAlbumPayload = {
  albumId: string;
  title: string;
  coverUrl?: string;
  artists?: string[];
};

export async function saveAlbumToLibrary(payload: SaveAlbumPayload) {
  const res = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to save album to library");
  }

  const data = await res.json();
  return data as { ok?: boolean; dup?: boolean; error?: string };
}
