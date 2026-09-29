"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/client";

export default function CreateGig() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pay, setPay] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function createGig() {
    if (!title || !pay) {
      alert("Please fill in the title and pay.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("student_gigs").insert({
      owner_id: user.id,
      title,
      description,
      pay: Number(pay),
      location,
      deadline,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Gig posted successfully!");

    setTitle("");
    setDescription("");
    setPay("");
    setLocation("");
    setDeadline("");

    window.location.reload();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-black">Post a Gig</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Gig title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="number"
          placeholder="Pay ($)"
          value={pay}
          onChange={(e) => setPay(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <button
          onClick={createGig}
          disabled={loading}
          className="rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Gig"}
        </button>
      </div>
    </section>
  );
}