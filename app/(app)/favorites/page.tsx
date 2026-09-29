"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/client";
import ListingCard from "../marketplace/components/ListingCard";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
};

type Favorite = {
  id: string;
  item_id: string;
};

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: favoritesData, error: favoritesError } = await supabase
      .from("marketplace_favorites")
      .select("id, item_id")
      .eq("user_id", user.id);

    if (favoritesError) {
      alert(favoritesError.message);
      setLoading(false);
      return;
    }

    const favorites = (favoritesData as Favorite[]) || [];
    const itemIds = favorites.map((fav) => fav.item_id);

    if (itemIds.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    const { data: listingsData, error: listingsError } = await supabase
      .from("marketplace_items")
      .select("id, title, description, price, category, image_url")
      .in("id", itemIds);

    if (listingsError) {
      alert(listingsError.message);
      setLoading(false);
      return;
    }

    setListings((listingsData as Listing[]) || []);
    setLoading(false);
  }

  if (loading) {
    return <p className="py-10 text-center text-gray-400">Loading favorites...</p>;
  }

  return (
    <main className="space-y-8">
      <h1 className="text-5xl font-black">Saved Listings ❤️</h1>

      {listings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">No saved listings</h2>
          <p className="mt-2 text-gray-400">
            Save listings from the marketplace to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((item) => (
            <ListingCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description || ""}
              price={item.price}
              category={item.category || "General"}
              imageUrl={item.image_url || undefined}
              sellerName="Student"
            />
          ))}
        </div>
      )}
    </main>
  );
}