"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/client";
import EventCard from "./EventCard";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  image_url: string | null;
};

export default function EventGrid() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        location,
        event_date,
        image_url
      `)
      .order("event_date", { ascending: true });

    if (error) {
      alert(error.message);
      setEvents([]);
    } else {
      setEvents((data as Event[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-gray-400">
        Loading events...
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-2xl font-bold">No events yet</h2>

        <p className="mt-2 text-gray-400">
          Be the first to create a campus event.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          title={event.title}
          description={event.description || ""}
          location={event.location || "Campus"}
          eventDate={event.event_date}
          imageUrl={event.image_url || ""}
        />
      ))}
    </div>
  );
}