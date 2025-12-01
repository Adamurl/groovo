/**
 * Purpose:
 *   The API endpoint for  backend, for managing a user's Library (saved albums).
 *
 * Scope:
 *   - Used by the Library page and "Add to Library" button on album pages
 *   - GET  /api/library - returns all albums saved by a user
 *   - POST /api/library - saves a new album to the user's Library 
 *   - Uses NextAuth to ensure requests are user-specific and protected
 *
 * Role:
 *   GET handler:
 *     - Authenticates the user
 *     - Fetches all (userId, album) entries from the "albums" collection
 *     - Sorts the albums by savedAt: -1 (most recent first)
 *     - Returns a full list of the user's saved albums
 *
 *   POST handler:
 *     - Authenticates the user
 *     - Handles incoming album metadata (albumId, title, coverUrl, artists)
 *     - Prevent invalid inserts 
 *     - Inserts a new library entry (avoids duplicates using userId + albumId)
 *
 * Deps:
 *   - next-auth (getServerSession) for authentication
 *   - lib/mongodb for DB connection
 *   - ensureIndexes() to guarantee required indexes on the albums collection
 *
 * Notes:
 *   - "upsert" ensures that saving the same album twice does not create duplicates
 *   - Everything done is scoped to a specific user's userId
 *   - Renders album cards in the Library UI using metadata
 *
 * Contributions (Srikar):
 *   - Implemented the Library feature's backend API routes
 *   - Wired the "Add to Library" functionality to this POST route
 *   - Debugged issues with albums not saving or overwriting incorrectly
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/ensure-indexes";

export const runtime = "nodejs";

function getUserId(session: any): string | null {
  // Your NextAuth session sets session.user.id in [...nextauth]/route.ts
  return session?.user?.id ?? session?.user?.email ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureIndexes();
  const database = await db();

  const docs = await database
    .collection("albums")
    .find({ userId })
    .sort({ savedAt: -1 })
    .toArray();

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const albumId = String(body?.albumId || "").trim();
  const title   = String(body?.title || "").trim();
  const coverUrl = body?.coverUrl ? String(body.coverUrl) : undefined;
  const artists  = Array.isArray(body?.artists) ? body.artists.map(String) : undefined;

  if (!albumId || !title) {
    return NextResponse.json({ error: "albumId and title are required" }, { status: 400 });
  }

  await ensureIndexes();
  const database = await db();

  try {
    const doc = { userId, albumId, title, coverUrl, artists, savedAt: new Date() };
    await database.collection("albums").updateOne(
      { userId, albumId },
      { $setOnInsert: doc },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ ok: true, dup: true });
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
