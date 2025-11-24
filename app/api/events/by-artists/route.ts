import { NextResponse } from "next/server";

const API_KEY = process.env.TICKETMASTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { artists, location } = await req.json();

    if (!Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const events: any[] = [];

    for (const name of artists) {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(
        name
      )}&apikey=${API_KEY}`;

      const res = await fetch(url);
      const text = await res.text();

      // Detect HTML error
      if (text.trim().startsWith("<!DOCTYPE")) {
        console.error("Ticketmaster returned HTML (bad key or blocked request)");
        continue;
      }

      const data = JSON.parse(text);

      if (data?._embedded?.events) {
        events.push(
          ...data._embedded.events.map((ev: any) => {
            const venue = ev._embedded?.venues?.[0];
            return {
              ...ev,
              startDate: ev.dates?.start?.dateTime ?? null,
              city: venue?.city?.name ?? "",
              state: venue?.state?.name ?? "",
              country: venue?.country?.name ?? "",
            };
          })
        );
      }
    }

    // Filter by location if provided
    const filtered = location
      ? events.filter((ev) => {
          const loc = location.toLowerCase();
          return (
            ev.city.toLowerCase().includes(loc) ||
            ev.state.toLowerCase().includes(loc) ||
            ev.country.toLowerCase().includes(loc)
          );
        })
      : events;

    // Auto-sort by date
    filtered.sort((a, b) => {
      const da = new Date(a.startDate).getTime();
      const db = new Date(b.startDate).getTime();
      return da - db; // ascending chronological
    });

    return NextResponse.json({ events: filtered });
  } catch (err) {
    console.error("Ticketmaster error:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
