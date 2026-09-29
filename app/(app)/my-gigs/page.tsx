"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/client";

type Gig = {
  id: string;
  title: string;
  description: string | null;
  pay: number;
  location: string | null;
  deadline: string | null;
};

export default function MyGigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyGigs();
  }, []);

  async function loadMyGigs() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("student_gigs")
      .select("*")
      .eq("owner_id", user.id)
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
      <p className="p-10 text-center text-gray-400">
        Loading your gigs...
      </p>
    );
  }

  return (
    <main className="space-y-8">
      <h1 className="text-5xl font-black">My Posted Gigs</h1>

      {gigs.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">
            You haven't posted any gigs yet
          </h2>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-2xl font-black">{gig.title}</h2>

              <p className="mt-3 text-gray-300">
                {gig.description}
              </p>

              <p className="mt-4 font-bold text-green-400">
                ${gig.pay}
              </p>

              <p className="mt-2 text-gray-400">
                {gig.location}
              </p>

              <p className="mt-2 text-gray-500">
                {gig.deadline}
              </p>

              <Link
                href={`/my-gigs/${gig.id}`}
                className="mt-6 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
              >
                View Applicants
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}