import Link from "next/link";

type Props = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  imageUrl: string;
};

export default function EventCard({
  id,
  title,
  description,
  location,
  eventDate,
  imageUrl,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-64 w-full object-cover"
        />
      ) : (
        <div className="flex h-64 items-center justify-center bg-black/20">
          No Image
        </div>
      )}

      <div className="p-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
          Campus Event
        </p>

        <h2 className="mt-3 text-2xl font-black">
          {title}
        </h2>

        <p className="mt-4 text-gray-300">
          {description}
        </p>

        <div className="mt-6 space-y-2 text-gray-300">
          <p>📍 {location}</p>

          <p>
            📅{" "}
            {new Date(eventDate).toLocaleString()}
          </p>
        </div>

        <Link
          href={`/events/${id}`}
          className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200"
        >
          View Event
        </Link>
      </div>
    </div>
  );
}