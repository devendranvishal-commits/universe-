"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/client";
import RideCard from "./RideCard";

type Ride = {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats: number;
  price: number;
};

export default function RideGrid() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  async function loadRides() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("carpool_rides")
      .select(`
        id,
        origin,
        destination,
        departure_time,
        seats,
        price
      `)
      .order("departure_time", { ascending: true });

    if (error) {
      alert(error.message);
      setRides([]);
    } else {
      setRides((data as Ride[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-gray-400">
        Loading rides...
      </p>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-2xl font-bold">
          No rides available
        </h2>

        <p className="mt-2 text-gray-400">
          Be the first to offer a ride.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          id={ride.id}
          origin={ride.origin}
          destination={ride.destination}
          departureTime={ride.departure_time}
          seats={ride.seats}
          price={ride.price}
        />
      ))}
    </div>
  );
}