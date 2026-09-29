"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Car,
  CircleDollarSign,
  MapPin,
  Users,
} from "lucide-react";
import { createClient } from "../../../../lib/client";

type Ride = {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats: number;
  price: number;
  notes: string | null;
};

type RideRequest = {
  id: string;
  status: string;
};

export default function RideDetailsPage() {
  const params = useParams();
  const rideId = params.id as string;

  const [ride, setRide] = useState<Ride | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<RideRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    loadRide();
  }, [rideId]);

  async function loadRide() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);

    const { data: rideData, error: rideError } = await supabase
      .from("carpool_rides")
      .select(`
        id,
        driver_id,
        origin,
        destination,
        departure_time,
        seats,
        price,
        notes
      `)
      .eq("id", rideId)
      .single();

    if (rideError) {
      console.error(rideError.message);
      setRide(null);
      setLoading(false);
      return;
    }

    setRide(rideData as Ride);

    if (user && user.id !== rideData.driver_id) {
      const { data: requestData, error: requestError } = await supabase
        .from("carpool_requests")
        .select("id, status")
        .eq("ride_id", rideId)
        .eq("requester_id", user.id)
        .maybeSingle();

      if (requestError) {
        console.error(requestError.message);
      } else {
        setRequest((requestData as RideRequest | null) || null);
      }
    }

    setLoading(false);
  }

  async function requestRide() {
    if (!ride || !userId) {
      alert("Please log in.");
      return;
    }

    if (ride.driver_id === userId) {
      alert("You cannot request your own ride.");
      return;
    }

    setSendingRequest(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("carpool_requests")
      .insert({
        ride_id: ride.id,
        requester_id: userId,
        driver_id: ride.driver_id,
        status: "pending",
      })
      .select("id, status")
      .single();

    if (error) {
      setSendingRequest(false);

      if (error.code === "23505") {
        alert("You already requested this ride.");
      } else {
        alert(error.message);
      }

      return;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: ride.driver_id,
        title: "New ride request",
        message: `Someone requested to join your ride from ${ride.origin} to ${ride.destination}.`,
        type: "carpool_request",
        is_read: false,
        link: `/my-rides/${ride.id}`,
      });

    setSendingRequest(false);

    if (notificationError) {
      console.error(
        "Ride request saved, but notification failed:",
        notificationError.message
      );
    }

    setRequest(data as RideRequest);
    alert("Ride request sent successfully!");
  }

  async function cancelRequest() {
    if (!request || !userId) return;

    const confirmed = confirm("Cancel your ride request?");

    if (!confirmed) return;

    setSendingRequest(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("carpool_requests")
      .delete()
      .eq("id", request.id)
      .eq("requester_id", userId);

    setSendingRequest(false);

    if (error) {
      alert(error.message);
      return;
    }

    setRequest(null);
    alert("Ride request cancelled.");
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading ride...
      </p>
    );
  }

  if (!ride) {
    return (
      <h1 className="p-10 text-4xl font-black">
        Ride not found
      </h1>
    );
  }

  const isDriver = userId === ride.driver_id;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-700/30 to-cyan-700/20 p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-300">
          Carpool Ride
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {ride.origin} → {ride.destination}
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Review the ride details before requesting a seat.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="mt-1 font-bold">{ride.origin}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Car className="text-blue-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">Destination</p>
                <p className="mt-1 font-bold">{ride.destination}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-blue-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">Departure</p>

                <p className="mt-1 font-bold">
                  {new Date(ride.departure_time).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Users className="text-blue-300" size={22} />

              <div>
                <p className="text-sm text-gray-400">
                  Seats available
                </p>

                <p className="mt-1 font-bold">{ride.seats}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5 md:col-span-2">
            <div className="flex items-center gap-3">
              <CircleDollarSign
                className="text-blue-300"
                size={22}
              />

              <div>
                <p className="text-sm text-gray-400">
                  Price per seat
                </p>

                <p className="mt-1 text-2xl font-black">
                  ${ride.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-black/20 p-6">
          <h2 className="text-xl font-black">Driver Notes</h2>

          <p className="mt-3 text-gray-300">
            {ride.notes || "No additional notes provided."}
          </p>
        </div>

        {isDriver ? (
          <div className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
            <p className="font-bold text-blue-200">
              This is your ride listing.
            </p>
          </div>
        ) : request ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
            <p className="font-bold">
              Request status:{" "}
              <span className="capitalize text-blue-300">
                {request.status}
              </span>
            </p>

            {request.status === "pending" && (
              <button
                onClick={cancelRequest}
                disabled={sendingRequest}
                className="mt-4 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {sendingRequest
                  ? "Cancelling..."
                  : "Cancel Request"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={requestRide}
            disabled={sendingRequest}
            className="mt-8 rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            {sendingRequest
              ? "Sending..."
              : "Request to Join"}
          </button>
        )}
      </section>
    </main>
  );
}