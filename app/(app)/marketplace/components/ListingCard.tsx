"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Props = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  sellerName: string;
  imageUrl?: string;
};

export default function ListingCard({
  id,
  title,
  description,
  price,
  category,
  sellerName,
  imageUrl,
}: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [id]);

  async function checkFavorite() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("marketplace_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", id)
      .maybeSingle();

    setSaved(!!data);
  }

  async function toggleFavorite() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to save listings.");
      setLoading(false);
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("marketplace_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", id);

      if (error) alert(error.message);
      else setSaved(false);
    } else {
      const { error } = await supabase.from("marketplace_favorites").insert({
        user_id: user.id,
        item_id: id,
      });

      if (error) alert(error.message);
      else setSaved(true);
    }

    setLoading(false);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
      <Link href={`/marketplace/${id}`} className="block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-black/30 text-gray-500">
            No image
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/marketplace/${id}`}>
            <h3 className="text-2xl font-black hover:text-emerald-300">
              {title}
            </h3>
          </Link>

          <span className="rounded-full bg-green-600 px-4 py-1 text-sm font-bold">
            ${price}
          </span>
        </div>

        <p className="mt-2 font-semibold text-emerald-400">{category}</p>

        <p className="mt-4 text-gray-300">{description}</p>

        <div className="mt-6 rounded-2xl bg-black/30 px-4 py-3 text-sm text-gray-300">
          Seller: <span className="font-bold text-white">{sellerName}</span>
        </div>

        <button
          onClick={toggleFavorite}
          disabled={loading}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold transition ${
            saved
              ? "bg-pink-500 text-white"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}