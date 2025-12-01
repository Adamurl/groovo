/**
 * Purpose:
 *   Backend API endpoint for removing a saved album from a user's Library using a DELETE request
 *
 * Scope:
 *   - Handles DELETE requests to /api/library/:albumId
 *   - Authenticates user via NextAuth session
 *   - Deletes the (userId, albumId) pair from the MongoDB "albums" collection
 *
 * Role:
 *   - Validates incoming albumId parameter
 *   - Ensures the user is authenticated before modifying their Library
 *   - Normalizes and sanitizes albumId
 *   - Performs a protected delete operation scoped specifically to the authenticated user
 *
 * Deps:
 *   - next-auth (getServerSession) for authentication
 *   - lib/mongodb for fetching user data
 *   - ensureIndexes() for guaranteed index availability on the albums collection
 *
 * Notes:
 *   - Only removes the album for the current user 
 *   - Returns JSON responses for Unauthorized (401) or Bad Request (400))
 *   - Uses Node.js runtime for compatibility with MongoDB driver
 *
 * Contributions (Srikar):
 *   - Implemented the Library "remove album" feature including:
 *       Testing DELETE behavior across Library and Album pages
 *       Wiring the Library UI to this route for real-time updates
 *       Fixing earlier issues where albums were not deleting correctly
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/ensure-indexes";

export const runtime = "nodejs";

function getUserId(session: any): string | null {
  return session?.user?.id ?? session?.user?.email ?? null;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {

  const { albumId: rawAlbumId } = await params; 
  const albumId = String(rawAlbumId || "").trim();

  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!albumId) return NextResponse.json({ error: "albumId required" }, { status: 400 });

  await ensureIndexes();
  const database = await db();

  await database.collection("albums").deleteOne({ userId, albumId });
  return NextResponse.json({ ok: true });
}
