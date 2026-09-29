"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../../lib/client";
import ListingCard from "./ListingCard";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  profiles:
    | {
        full_name: string;
      }[]
    | null;
};

const categories = [
  "All",
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "School Supplies",
];

export default function ListingGrid() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("marketplace_items")
      .select(`
        id,
        title,
        description,
        price,
        category,
        image_url,
        profiles (
          full_name
        )
      `)
      .eq("sold", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setListings([]);
    } else {
      setListings((data as Listing[]) || []);
    }

    setLoading(false);
  }

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (item.category ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, search, selectedCategory]);

  if (loading) {
    return (
      <p className="py-10 text-center text-gray-400">
        Loading listings...
      </p>
    );
  }

  return (
    <div className="space-y-6">

      <input
        type="text"
        placeholder="🔍 Search marketplace..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
      />

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-5 py-2 font-semibold transition ${
              selectedCategory === category
                ? "bg-emerald-500 text-white"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">
            No matching listings
          </h2>

          <p className="mt-2 text-gray-400">
            Try another search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((item) => (
            <ListingCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description || ""}
              price={item.price}
              category={item.category || "General"}
              imageUrl={item.image_url || undefined}
              sellerName={item.profiles?.[0]?.full_name || "Student"}
            />
          ))}
        </div>
      )}
    </div>
  );
}