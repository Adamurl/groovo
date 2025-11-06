// utils/reviews.ts

// ---------- Types ----------

/** Raw review doc as returned by /api/reviews (Mongo-ish) */
export type ApiReview = {
  _id?: string | { $oid: string };
  id?: string;
  userId?: string;
  rating: number;
  body: string;
  createdAt: string;
  user?: { username?: string; image?: string } | null;
};

/** UI-facing review shape (what ReviewsPanel expects) */
export type UIReview = {
  id: string;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string; // ISO
};

export type PostReviewPayload = {
  albumId: string;
  rating: number;
  body: string;
  album?: {
    name: string;
    artists: string[];
  } | null;
};

export type PostReviewResult =
  | { ok: true; id: string }
  | { ok: false; status: number; message: string };

export type FetchReviewsResult =
  | { ok: true; items: UIReview[] }
  | { ok: false; message: string };

// ---------- Helpers ----------

/** Extracts a stable id regardless of _id variant */
function extractId(r: ApiReview): string {
  if (typeof r?._id === "object" && (r?._id as any)?.$oid) return (r._id as any).$oid;
  if (typeof r?._id === "string") return r._id;
  if (r?.id) return r.id;
  return crypto.randomUUID();
}

/** Map ApiReview -> UIReview (keeps UI components dumb/simple) */
export function mapApiReviewToUI(r: ApiReview): UIReview {
  return {
    id: extractId(r),
    userName: r?.user?.username ?? "Anonymous",
    rating: Number(r?.rating ?? 0),
    reviewText: String(r?.body ?? ""),
    createdAt: String(r?.createdAt ?? new Date().toISOString()),
  };
}

/** Build a schema-friendly album snapshot (artists as strings) */
export function buildAlbumSnapshotForDb(spotifyAlbum: any | null) {
  if (!spotifyAlbum) return null;
  const artists = Array.isArray(spotifyAlbum.artists)
    ? spotifyAlbum.artists.map((a: any) => (typeof a === "string" ? a : a?.name)).filter(Boolean)
    : [];
  return {
    name: String(spotifyAlbum.name ?? ""),
    artists,
  };
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

/** Normalize common API error bodies (Zod arrays, strings, etc.) */
function normalizeErrorBody(body: any): string {
  if (!body) return "Unknown error";
  if (typeof body === "string") return body;
  if (typeof body?.error === "string") return body.error;
  if (Array.isArray(body?.error) && body.error[0]?.message) return body.error[0].message;
  if (body?.message) return body.message;
  return "Request failed";
}

// ---------- Network Helpers ----------

/** POST /api/reviews with proper cookies and normalized errors */
export async function postReview(payload: PostReviewPayload): Promise<PostReviewResult> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const data = await res.json();
    return { ok: true, id: String(data?.id ?? "") };
  }

  const body = await safeJson(res);
  const message = normalizeErrorBody(body);

  return { ok: false, status: res.status, message };
}

/** GET /api/reviews?albumId=... (single page) */
export async function fetchReviewsPage(params: {
  albumId: string;
  page?: number;
  pageSize?: number;
}): Promise<FetchReviewsResult> {
  const qs = new URLSearchParams({
    albumId: params.albumId,
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
  });

  const res = await fetch(`/api/reviews?${qs.toString()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    const body = await safeJson(res);
    return { ok: false, message: normalizeErrorBody(body) };
  }

  const data = await res.json(); // { items: ApiReview[] }
  const items: UIReview[] = (data?.items ?? []).map(mapApiReviewToUI);
  return { ok: true, items };
}
