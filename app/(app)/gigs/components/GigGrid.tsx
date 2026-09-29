"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/client";
import GigCard from "./GigCard";

type Gig = {
  id: string;
  title: string;
  description: string | null;
  pay: number;
  location: string | null;
  deadline: string | null;
};

export default function GigGrid() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGigs();
  }, []);

  async function loadGigs() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("student_gigs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setGigs((data as Gig[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-gray-400">
        Loading gigs...
      </p>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-2xl font-bold">No gigs yet</h2>
        <p className="mt-2 text-gray-400">
          Be the first to post a campus gig.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {gigs.map((gig) => (
        <GigCard
          key={gig.id}
          id={gig.id}
          title={gig.title}
          description={gig.description || ""}
          pay={gig.pay}
          location={gig.location || ""}
          deadline={gig.deadline || ""}
        />
      ))}
    </div>
  );
}