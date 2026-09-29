"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/client";
import HousingCard from "./HousingCard";

type Housing = {
  id: string;
  title: string;
  description: string | null;
  rent: number;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  available_from: string | null;
  image_url: string | null;
};

export default function HousingGrid() {
  const [listings, setListings] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("housing_listings")
      .select(`
        id,
        title,
        description,
        rent,
        location,
        bedrooms,
        bathrooms,
        available_from,
        image_url
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setListings([]);
    } else {
      setListings((data as Housing[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-gray-400">
        Loading housing...
      </p>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-2xl font-bold">
          No housing listings yet
        </h2>

        <p className="mt-2 text-gray-400">
          Be the first to post a housing listing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {listings.map((listing) => (
        <HousingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          description={listing.description || ""}
          rent={listing.rent}
          location={listing.location || "Campus"}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          availableFrom={listing.available_from || ""}
          imageUrl={listing.image_url || ""}
        />
      ))}
    </div>
  );
}