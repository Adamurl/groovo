// app/api/library/[album_id]/route.ts
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
  req: Request,
  ctx: { params: Promise<{ album_id: string }> }
) {
  const { album_id } = await ctx.params;        // Fixing delete issue here
  const albumId = album_id.trim();

  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!albumId) {
    return NextResponse.json({ error: "albumId required" }, { status: 400 });
  }

  await ensureIndexes();
  const database = await db();
  const albumsCollection = database.collection("albums");

  const result = await albumsCollection.deleteOne({ userId, albumId });

  return NextResponse.json({
    ok: true,
    deletedCount: result.deletedCount,
  });
}
