"use client";

import { useRouter } from "next/navigation";
import Header from "../components/Header";
import UserHeader from "@/app/profile/UserHeader";
import SavedAlbumsGrid from "@/app/profile/SavedAlbumsGrid";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function ProfilePage() {
  const router = useRouter();
  const { user: currentUser, isLoading, errorText } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (errorText) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        <p>{errorText}</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        <p>You must log in to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <Header />

      <div className="mx-auto max-w-5xl px-6 pb-12">
        {/* User header now includes editing logic */}
        <UserHeader user={currentUser} loading={false} />

        {/* Saved Albums */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Saved Albums & Reviews</h2>
          <SavedAlbumsGrid albums={[]} loading={false} error={null} />
        </section>
      </div>
    </main>
  );
}
