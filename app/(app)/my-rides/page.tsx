"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/client";

type Ride = {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats: number;
  price: number;
};

export default function MyRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  async function loadRides() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("carpool_rides")
      .select("*")
      .eq("driver_id", user.id)
      .order("departure_time");

    if (error) {
      alert(error.message);
    } else {
      setRides((data as Ride[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <main className="space-y-8">
      <h1 className="text-5xl font-black">
        My Rides
      </h1>

      {rides.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          You haven't created any rides yet.
        </div>
      ) : (
        rides.map((ride) => (
          <div
            key={ride.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <h2 className="text-3xl font-black">
              {ride.origin} → {ride.destination}
            </h2>

            <p className="mt-2">
              {new Date(ride.departure_time).toLocaleString()}
            </p>

            <p className="mt-2">
              Seats: {ride.seats}
            </p>

            <p className="mt-2">
              Price: ${ride.price}
            </p>

            <Link
              href={`/my-rides/${ride.id}`}
              className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black"
            >
              Manage Requests
            </Link>
          </div>
        ))
      )}
    </main>
  );
}