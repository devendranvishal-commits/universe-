"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "../../../../lib/client";
import DeleteListingButton from "./DeleteListingButton";
import EditListingButton from "./EditListingButton";
import FavoriteButton from "./FavoriteButton";
import MarkSoldButton from "./MarkSoldButton";

type Item = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
};

export default function MarketplaceItemPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);

    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error.message);
      setItem(null);
    } else {
      setItem(data);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!item || !userId || !message.trim()) return;

    setSending(true);
    setSuccess("");

    const supabase = createClient();

    const { error } = await supabase.from("marketplace_messages").insert({
      listing_id: item.id,
      sender_id: userId,
      receiver_id: item.seller_id,
      message,
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setMessage("");
    setSuccess("Message sent to seller!");
  }

  if (loading) {
    return <p className="p-10 text-gray-400">Loading listing...</p>;
  }

  if (!item) {
    return <h1 className="p-10 text-4xl font-black">Listing not found</h1>;
  }

  const isSeller = userId === item.seller_id;

  return (
    <main className="space-y-8">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="h-[450px] w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-[450px] items-center justify-center rounded-3xl bg-black/20">
          No Image
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-5xl font-black">{item.title}</h1>

          <span className="rounded-full bg-green-600 px-6 py-2 text-xl font-bold">
            ${item.price}
          </span>
        </div>

        <p className="mt-4 text-lg text-emerald-400">
          {item.category || "General"}
        </p>

        <p className="mt-8 text-lg text-gray-300">{item.description}</p>

        <div className="mt-6">
          <FavoriteButton listingId={item.id} />
        </div>

        {isSeller ? (
          <div className="mt-8 flex flex-wrap gap-4">
            <EditListingButton listingId={item.id} />
            <MarkSoldButton listingId={item.id} />
            <DeleteListingButton listingId={item.id} />
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-2xl font-black">Message Seller</h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, is this still available?"
              className="mt-4 min-h-28 w-full rounded-2xl bg-white/5 px-5 py-4 outline-none"
            />

            {success && (
              <p className="mt-3 font-semibold text-green-300">{success}</p>
            )}

            <button
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-black disabled:opacity-50"
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