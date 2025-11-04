import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = await db();
    const users = database.collection("users");
    const albums = database.collection("albums");

    // 1️⃣ Fetch user, include bio
    const user = await users.findOne(
      { email: session.user.email },
      {
        projection: {
          password: 1,
          bio: 1,
          name: 1,
          image: 1,
          username: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2️⃣ Count albums
    const albumsCount = await albums.countDocuments({ userId: new ObjectId(user._id) });

    // 3️⃣ Optional: placeholder stats
    const reviewsCount = 0; // extend if you store reviews
    const followersCount = 0; // extend if you store followers

    // Attach stats to user object
    user.albumsCount = albumsCount;
    user.reviewsCount = reviewsCount;
    user.followersCount = followersCount;
    user.bio = user.bio || "This user has no bio yet.";

    // 4️⃣ Fetch saved albums
    const savedAlbums = await albums
      .find({ userId: new ObjectId(user._id) })
      .toArray()
      .catch(() => []);

    // 5️⃣ Return full profile
    return NextResponse.json({ user, savedAlbums });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
