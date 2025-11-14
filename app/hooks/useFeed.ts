"use client";

import { useEffect, useState } from "react";

export function useFeed(page = 1, pageSize = 20) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/feed?page=${page}&pageSize=${pageSize}`, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed to load feed");
        return r.json();
      })
      .then((d) => alive && (setItems(d.items ?? []), setErr(null)))
      .catch((e) => alive && setErr(String(e?.message || e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  return { items, loading, error };
}
