import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/ensure-indexes";

export const runtime = "nodejs";

function getUserId(session: any): string | null {
  return session?.user?.id ?? session?.user?.email ?? null;
}

// GET /api/library  -> list saved albums for logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureIndexes();
  const database = await db();
  const albumsCollection = database.collection("albums");

  const docs = await albumsCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  const items = docs.map((doc: any) => ({
    albumId: doc.albumId,
    title:
      doc.title ??
      doc.albumSnapshot?.name ??
      doc.album?.name ??
      doc.spotifyAlbum?.name ??
      "",
    coverUrl:
      doc.coverUrl ??
      doc.albumSnapshot?.images?.[0]?.url ??
      doc.album?.images?.[0]?.url ??
      doc.spotifyAlbum?.images?.[0]?.url ??
      "",
    artists:
      doc.artists ??
      (Array.isArray(doc.albumSnapshot?.artists)
        ? doc.albumSnapshot.artists
            .map((a: any) =>
              typeof a === "string" ? a : a?.name ?? ""
            )
            .filter(Boolean)
        : []),
  }));

  return NextResponse.json(items);
}

// POST /api/library  -> save an album for logged-in user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const albumId = String(body?.albumId || "").trim();
  const title = String(body?.title || "").trim();
  const coverUrl = body?.coverUrl ? String(body.coverUrl) : undefined;
  const artists = Array.isArray(body?.artists) ? body.artists : [];

  if (!albumId || !title) {
    return NextResponse.json(
      { error: "albumId and title are required" },
      { status: 400 }
    );
  }

  await ensureIndexes();
  const database = await db();
  const albumsCollection = database.collection("albums");

  // Idempotent: if already exists for this user, just update fields
  await albumsCollection.updateOne(
    { userId, albumId },
    {
      $set: {
        userId,
        albumId,
        title,
        coverUrl,
        artists,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}

// DELETE /api/library/:albumId  -> remove one album
export async function DELETE(
  _req: Request,
  { params }: { params: { albumId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const albumId = String(params?.albumId || "").trim();
  if (!albumId) {
    return NextResponse.json(
      { error: "albumId required" },
      { status: 400 }
    );
  }

  await ensureIndexes();
  const database = await db();
  await database.collection("albums").deleteOne({ userId, albumId });

  return NextResponse.json({ ok: true });
}
