"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/client";

type Event = {
  id: string;
  title: string;
  location: string | null;
  event_date: string;
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("events")
      .select("id,title,location,event_date")
      .eq("organizer_id", user.id)
      .order("event_date");

    setEvents((data as Event[]) || []);
  }

  return (
    <main className="space-y-8">
      <h1 className="text-5xl font-black">
        My Events
      </h1>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          You haven't created any events yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-2xl font-bold">
                {event.title}
              </h2>

              <p className="mt-2 text-gray-400">
                {event.location}
              </p>

              <p className="mt-2 text-gray-400">
                {new Date(event.event_date).toLocaleString()}
              </p>

              <Link
                href={`/events/${event.id}`}
                className="mt-5 inline-block rounded-xl bg-white px-5 py-3 font-bold text-black"
              >
                View Event
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}