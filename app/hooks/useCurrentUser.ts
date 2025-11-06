"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shape of the authenticated user profile returned by /api/profile/me.
 */
export interface CurrentUserProfile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  image?: string;
  bio?: string;
  albumsCount?: number;
  reviewsCount?: number;
  followersCount?: number;
}

/**
 * useCurrentUser
 * - Single source of truth for auth state across the app.
 * - No automatic redirect; components decide how to react.
 * - Adds no-store (avoid cached 401s) and a single 401 retry (handles session race).
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Guard against state updates after unmount + ensure we retry at most once
  const hasRetried401 = useRef(false);
  const aborted = useRef(false);

  async function fetchMe(tryAgain = false) {
    try {
      const res = await fetch("/api/profile/me", {
        credentials: "include",
        cache: "no-store",         // ← prevent stale cached 401s
        headers: { "accept": "application/json" },
      });

      if (res.status === 401) {
        // If we haven't retried yet, wait briefly and try once more.
        if (!hasRetried401.current && !tryAgain) {
          hasRetried401.current = true;
          await new Promise(r => setTimeout(r, 150));
          if (!aborted.current) return fetchMe(true);
        }
        setUser(null);
        setErrorText(null);        // 401 isn't a "network error"—just unauthenticated
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch current user: ${res.status} ${res.statusText}`);
      }

      const payload = await res.json();
      setUser(payload.user ?? null);
      setErrorText(null);
    } catch (err: any) {
      if (!aborted.current) {
        console.error("useCurrentUser:", err);
        setErrorText(err?.message || "Unknown error");
        setUser(null);
      }
    } finally {
      if (!aborted.current) setIsLoading(false);
    }
  }

  useEffect(() => {
    aborted.current = false;
    fetchMe();
    return () => {
      aborted.current = true;
    };
  }, []);

  /**
   * Expose a manual refresh, useful after login/logout or profile updates.
   */
  const refresh = () => {
    setIsLoading(true);
    hasRetried401.current = false;
    return fetchMe();
  };

  return { user, isLoading, errorText, refresh };
}
