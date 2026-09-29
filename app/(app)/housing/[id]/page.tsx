"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Housing = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  rent: number;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  available_from: string | null;
  image_url: string | null;
};

export default function HousingDetailsPage() {
  const params = useParams();
  const housingId = params.id as string;

  const [listing, setListing] = useState<Housing | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadListing();
  }, [housingId]);

  async function loadListing() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);

    const { data, error } = await supabase
      .from("housing_listings")
      .select(`
        id,
        owner_id,
        title,
        description,
        rent,
        location,
        bedrooms,
        bathrooms,
        available_from,
        image_url
      `)
      .eq("id", housingId)
      .single();

    if (error) {
      console.error(error.message);
      setListing(null);
    } else {
      setListing(data as Housing);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!listing || !userId || !message.trim()) {
      return;
    }

    setSending(true);
    setSuccess("");

    const supabase = createClient();

    const { error } = await supabase.from("housing_messages").insert({
      housing_id: listing.id,
      sender_id: userId,
      receiver_id: listing.owner_id,
      message: message.trim(),
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setMessage("");
    setSuccess("Message sent to the owner!");
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading housing...
      </p>
    );
  }

  if (!listing) {
    return (
      <h1 className="p-10 text-3xl font-black">
        Housing listing not found.
      </h1>
    );
  }

  const isOwner = userId === listing.owner_id;

  return (
    <main className="space-y-8">
      {listing.image_url ? (
        <img
          src={listing.image_url.trim()}
          alt={listing.title}
          className="h-[450px] w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-[450px] items-center justify-center rounded-3xl bg-black/20 text-gray-400">
          No Image
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h1 className="text-5xl font-black">
            {listing.title}
          </h1>

          <span className="w-fit rounded-full bg-green-600 px-6 py-2 text-xl font-bold">
            ${listing.rent}/month
          </span>
        </div>

        <p className="mt-4 text-lg text-emerald-400">
          {listing.location || "Campus"}
        </p>

        <p className="mt-8 text-lg text-gray-300">
          {listing.description || "No description provided."}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-black/20 p-5">
            <p className="text-gray-400">Bedrooms</p>
            <h3 className="mt-2 text-3xl font-black">
              {listing.bedrooms ?? "-"}
            </h3>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <p className="text-gray-400">Bathrooms</p>
            <h3 className="mt-2 text-3xl font-black">
              {listing.bathrooms ?? "-"}
            </h3>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <p className="text-gray-400">Available From</p>
            <h3 className="mt-2 text-2xl font-black">
              {listing.available_from || "Flexible"}
            </h3>
          </div>
        </div>

        {isOwner ? (
          <div className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <p className="font-bold text-emerald-300">
              This is your housing listing.
            </p>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-2xl font-black">
              Contact Owner
            </h2>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Hi, is this housing still available?"
              className="mt-4 min-h-32 w-full rounded-2xl bg-white/5 px-5 py-4 outline-none"
            />

            {success && (
              <p className="mt-3 font-semibold text-green-300">
                {success}
              </p>
            )}

            <button
              onClick={sendMessage}
              disabled={sending || !message.trim() || !userId}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}