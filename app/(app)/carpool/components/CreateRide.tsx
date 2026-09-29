"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/client";

export default function CreateRide() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function createRide() {
    if (!origin || !destination || !departureTime || !seats) {
      alert("Please fill in origin, destination, departure time, and seats.");
      return;
    }

    const seatCount = Number(seats);
    const ridePrice = price ? Number(price) : 0;

    if (seatCount < 1) {
      alert("Seats must be at least 1.");
      return;
    }

    if (ridePrice < 0) {
      alert("Price cannot be negative.");
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

    const { error } = await supabase.from("carpool_rides").insert({
      driver_id: user.id,
      origin: origin.trim(),
      destination: destination.trim(),
      departure_time: departureTime,
      seats: seatCount,
      price: ridePrice,
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Ride posted successfully!");

    setOrigin("");
    setDestination("");
    setDepartureTime("");
    setSeats("");
    setPrice("");
    setNotes("");

    window.location.reload();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-black">Offer a Ride</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Pickup location"
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="datetime-local"
          value={departureTime}
          onChange={(event) => setDepartureTime(event.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="number"
          min="1"
          placeholder="Available seats"
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price per seat ($)"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <textarea
          placeholder="Notes, meeting point, luggage details..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-32 rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <button
          onClick={createRide}
          disabled={loading}
          className="rounded-xl bg-white py-4 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Ride"}
        </button>
      </div>
    </section>
  );
}