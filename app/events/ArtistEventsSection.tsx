"use client";

export default function ArtistEventsSection({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-zinc-500 mt-4 italic">
        No upcoming events found for reviewed artists.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {events.map((ev) => {
        const img = ev.images?.[0]?.url;
        return (
          <div
            key={ev.id}
            className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 transition shadow"
          >
            {img && (
              <img
                src={img}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <h3 className="mt-3 text-lg font-semibold">{ev.name}</h3>

            <p className="text-zinc-400 text-sm mt-1">
              {ev._embedded?.venues?.[0]?.name}
            </p>

            <p className="text-zinc-400 text-sm">
              {ev.dates?.start?.localDate}
            </p>

            <a
              href={ev.url}
              target="_blank"
              className="text-violet-400 text-sm mt-2 inline-block hover:underline"
            >
              View Tickets →
            </a>
          </div>
        );
      })}
    </div>
  );
}
