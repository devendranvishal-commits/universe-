import Link from "next/link";

type Props = {
  id: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  availableFrom: string;
  imageUrl: string;
};

export default function HousingCard({
  id,
  title,
  description,
  rent,
  location,
  bedrooms,
  bathrooms,
  availableFrom,
  imageUrl,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
      {imageUrl ? (
        <img
          src={imageUrl.trim()}
          alt={title}
          className="h-64 w-full object-cover"
          onError={(e) => {
            console.error("Housing image failed:", imageUrl);
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-64 items-center justify-center bg-black/20 text-white">
          No Image
        </div>
      )}

      <div className="p-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
          Housing
        </p>

        <h2 className="mt-3 text-2xl font-black">{title}</h2>

        <p className="mt-4 text-gray-300">{description}</p>

        <div className="mt-6 space-y-2 text-gray-300">
          <p>
            💲{" "}
            <span className="font-bold text-green-400">
              ${rent}/month
            </span>
          </p>

          <p>📍 {location}</p>

          <p>
            🛏 {bedrooms ?? "-"} Bed • 🚿 {bathrooms ?? "-"} Bath
          </p>

          <p>📅 Available: {availableFrom || "Flexible"}</p>
        </div>

        <Link
          href={`/housing/${id}`}
          className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}