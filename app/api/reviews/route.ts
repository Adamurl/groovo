import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/ensure-indexes";
import { PageSchema, ReviewCreateSchema } from "@/lib/validation";
import { ObjectId } from "mongodb";

/**
 * Docs:
 * - Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 * - Input validation with Zod: https://zod.dev/
 * - MongoDB Node.js Driver: https://www.mongodb.com/docs/drivers/node/current/
 * - createIndexes: https://www.mongodb.com/docs/drivers/node/current/indexes/
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureIndexes();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ReviewCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { albumId, rating, body, album } = parsed.data;
  const database = await db();
  const now = new Date();

  try {
    const doc = {
      userId: session.user.id,
      albumId,
      rating,
      body,
      albumSnapshot: album ?? null,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null as Date | null,
    };
    const res = await database.collection("reviews").insertOne(doc);
    return NextResponse.json({ id: String(res.insertedId) }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "You already reviewed this album." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await ensureIndexes();
  const session = await getServerSession(authOptions);
  const database = await db();

  const url = new URL(req.url);
  const albumId = url.searchParams.get("albumId");
  const page = Number(url.searchParams.get("page") ?? 1) || 1;
  const pageSize = Number(url.searchParams.get("pageSize") ?? 20) || 20;

  if (!albumId) {
    return NextResponse.json({ error: "Missing albumId" }, { status: 400 });
  }

  // 1) Query reviews for this album (exclude soft-deleted)
  const query = {
    albumId,
    deletedAt: null,
  };

  const reviews = await database
    .collection("reviews")
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  if (reviews.length === 0) {
    return NextResponse.json({ items: [] });
  }

  // 2) Collect distinct userIds and reviewIds
  const userIds = Array.from(
    new Set(
      reviews
        .map((r: any) => r.userId)
        .filter(Boolean)
    )
  );

  const reviewIds = reviews.map((r: any) => String(r._id));

  // 3) Fetch all authors in one go
  const users = await database
    .collection("users")
    .find(
      {
        _id: { $in: userIds.map((id) => new ObjectId(String(id))) },
      },
      {
        projection: { _id: 1, username: 1, name: 1, image: 1 },
      }
    )
    .toArray();

  const authorById = new Map<
    string,
    { id: string; username?: string | null; name?: string | null; image?: string | null }
  >(
    users.map((u: any) => [
      String(u._id),
      {
        id: String(u._id),
        username: u.username ?? null,
        name: u.name ?? null,
        image: u.image ?? null,
      },
    ])
  );

  // 4) Fetch likes for the current viewer (if logged in)
  let likedSet = new Set<string>();
  if (session?.user?.id) {
    const likes = await database
      .collection("likes")
      .find({
        targetType: "review",
        userId: session.user.id,
        targetId: { $in: reviewIds },
      })
      .toArray();

    likedSet = new Set(likes.map((l: any) => String(l.targetId)));
  }

  // 5) Normalize to ReviewResponse[]
  const items = reviews.map((review: any) => {
    const author = authorById.get(String(review.userId)) ?? null;

    return {
      _id: String(review._id),
      id: String(review._id),
      userId: review.userId,
      albumId: review.albumId,
      rating: review.rating,
      body: review.body,
      likeCount: review.likeCount ?? 0,
      commentCount: review.commentCount ?? 0,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      deletedAt: review.deletedAt ?? null,
      albumSnapshot: review.albumSnapshot ?? null,
      author,
      viewerLiked: likedSet.has(String(review._id)),
    };
  });

  return NextResponse.json({ items });
}
