import Link from "next/link";

type Props = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  price: number;
};

export default function RideCard({
  id,
  origin,
  destination,
  departureTime,
  seats,
  price,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
        Carpool
      </p>

      <h2 className="mt-3 text-2xl font-black">
        {origin} → {destination}
      </h2>

      <div className="mt-6 space-y-2 text-gray-300">
        <p>🕒 {new Date(departureTime).toLocaleString()}</p>
        <p>💺 {seats} seat(s)</p>
        <p>💲 ${price}</p>
      </div>

      <Link
        href={`/carpool/${id}`}
        className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200"
      >
        View Ride
      </Link>
    </div>
  );
}