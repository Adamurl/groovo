"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import UserHeader from "@/app/profile/UserHeader";
import SavedAlbumsGrid from "@/app/profile/SavedAlbumsGrid";
import { useCurrentUser } from "../hooks/useCurrentUser";

/**
 * ProfilePage
 * - Loads the current user via useCurrentUser()
 * - Shows loading, error, or content
 * - Optionally redirects to /login if confirmed unauthenticated
 */
export default function ProfilePage() {
  const router = useRouter();
  const {
    user: currentUser,
    isLoading: isUserLoading,
    errorText: userError,
  } = useCurrentUser();

  /**
   * If we're done loading, not errored, and definitely not logged in,
   * you can choose to redirect. The retry in the hook already handled
   * transient 401s, so this redirect is safer now.
   */
  useEffect(() => {
    if (!isUserLoading && !userError && !currentUser) {
      router.replace("/login");
    }
  }, [isUserLoading, userError, currentUser, router]);

  // 1) Loading view
  if (isUserLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>Loading profile...</p>
      </main>
    );
  }

  // 2) Network/server error view (not the same as 401/unauthenticated)
  if (userError) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        <p>{userError}</p>
      </main>
    );
  }

  // 3) Unauthenticated fallback (if redirect didn't happen yet)
  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        <p>You must log in to view your profile.</p>
      </main>
    );
  }

  // 4) Authenticated view
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      {/* Site header can also use useCurrentUser() to show Profile vs Login */}
      <Header />

      <div className="mx-auto max-w-7xl px-6 pb-12">
        {/* User header */}
        <UserHeader user={currentUser} loading={false} />

        {/* Saved albums & reviews */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Saved Albums & Reviews</h2>
          {/* If you also fetch saved albums from /api/profile/me, pass them here. */}
          <SavedAlbumsGrid albums={[]} loading={false} error={null} />
        </section>
      </div>
    </main>
  );
}
