"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/client";

export default function CreateHousing() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function createHousing() {
    if (!title || !rent) {
      alert("Please fill in the required fields.");
      return;
    }

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

    let imageUrl = "";

    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("housing-images")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("housing-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("housing_listings").insert({
      owner_id: user.id,
      title,
      description,
      rent: Number(rent),
      location,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      available_from: availableFrom || null,
      image_url: imageUrl,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Housing listing created!");
    window.location.reload();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-black">Post Housing</h2>

      <div className="grid gap-4">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <input type="number" placeholder="Monthly Rent ($)" value={rent} onChange={(e) => setRent(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <input type="number" placeholder="Bedrooms" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <input type="number" placeholder="Bathrooms" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />
        <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className="rounded-xl bg-black/30 px-5 py-4 outline-none" />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button onClick={createHousing} disabled={loading} className="rounded-xl bg-white py-4 font-bold text-black hover:bg-gray-200 disabled:opacity-50">
          {loading ? "Posting..." : "Post Housing"}
        </button>
      </div>
    </section>
  );
}