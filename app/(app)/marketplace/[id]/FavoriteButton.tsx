"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Props = {
  listingId: string;
};

export default function FavoriteButton({ listingId }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [listingId]);

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
      .eq("item_id", listingId)
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
      alert("Please log in.");
      setLoading(false);
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("marketplace_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", listingId);

      if (error) {
        alert(error.message);
      } else {
        setSaved(false);
      }
    } else {
      const { error } = await supabase.from("marketplace_favorites").insert({
        user_id: user.id,
        item_id: listingId,
      });

      if (error) {
        alert(error.message);
      } else {
        setSaved(true);
      }
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold transition ${
        saved
          ? "bg-pink-500 text-white"
          : "bg-white text-black hover:bg-gray-200"
      }`}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save Listing"}
    </button>
  );
}