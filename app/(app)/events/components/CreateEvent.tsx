"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/client";

export default function CreateEvent() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function createEvent() {
    if (!title || !eventDate) {
      alert("Please fill in the required fields.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title,
      description,
      location,
      event_date: eventDate,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Event created successfully!");

    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");

    window.location.reload();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-black">
        Create Event
      </h2>

      <div className="grid gap-4">
        <input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <button
          onClick={createEvent}
          disabled={loading}
          className="rounded-xl bg-white py-4 font-bold text-black hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </section>
  );
}