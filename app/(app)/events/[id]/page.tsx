"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { createClient } from "../../../../lib/client";

type EventDetails = {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  image_url: string | null;
};

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [userId, setUserId] = useState("");
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingRsvp, setSavingRsvp] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || "");

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select(`
        id,
        organizer_id,
        title,
        description,
        location,
        event_date,
        image_url
      `)
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error(eventError.message);
      setEvent(null);
      setLoading(false);
      return;
    }

    setEvent(eventData as EventDetails);

    const { count, error: countError } = await supabase
      .from("event_rsvps")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("event_id", eventId);

    if (!countError) {
      setAttendeeCount(count || 0);
    }

    if (user) {
      const { data: rsvpData } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      setHasRsvped(!!rsvpData);
    }

    setLoading(false);
  }

  async function toggleRsvp() {
    if (!userId) {
      alert("Please log in.");
      return;
    }

    setSavingRsvp(true);

    const supabase = createClient();

    if (hasRsvped) {
      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (error) {
        alert(error.message);
        setSavingRsvp(false);
        return;
      }

      setHasRsvped(false);
      setAttendeeCount((current) => Math.max(0, current - 1));
    } else {
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: eventId,
        user_id: userId,
      });

      if (error) {
        alert(error.message);
        setSavingRsvp(false);
        return;
      }

      setHasRsvped(true);
      setAttendeeCount((current) => current + 1);
    }

    setSavingRsvp(false);
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading event...
      </p>
    );
  }

  if (!event) {
    return (
      <h1 className="p-10 text-4xl font-black">
        Event not found
      </h1>
    );
  }

  const isOrganizer = userId === event.organizer_id;

  return (
    <main className="space-y-8">
      {event.image_url ? (
        <img
          src={event.image_url.trim()}
          alt={event.title}
          className="h-[450px] w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-[450px] items-center justify-center rounded-3xl bg-black/20 text-gray-400">
          No Image
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-300">
              Campus Event
            </p>

            <h1 className="mt-3 text-5xl font-black">
              {event.title}
            </h1>
          </div>

          <div className="rounded-2xl bg-purple-500/15 px-5 py-4">
            <div className="flex items-center gap-2 text-purple-200">
              <Users size={20} />
              <span className="font-bold">
                {attendeeCount} attending
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-purple-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">
                  Date and time
                </p>

                <p className="mt-1 font-bold">
                  {new Date(event.event_date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <MapPin className="text-purple-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">
                  Location
                </p>

                <p className="mt-1 font-bold">
                  {event.location || "Campus"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-lg leading-8 text-gray-300">
          {event.description || "No description provided."}
        </p>

        {isOrganizer ? (
          <div className="mt-10 rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
            <p className="font-bold text-purple-200">
              You are the organizer of this event.
            </p>
          </div>
        ) : (
          <button
            onClick={toggleRsvp}
            disabled={savingRsvp}
            className={`mt-10 rounded-2xl px-8 py-4 font-bold transition disabled:opacity-50 ${
              hasRsvped
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {savingRsvp
              ? "Saving..."
              : hasRsvped
                ? "Going"
                : "RSVP"}
          </button>
        )}
      </section>
    </main>
  );
}