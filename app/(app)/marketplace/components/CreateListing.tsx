"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/client";

export default function CreateListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function createListing() {
    if (!title || !price || !category) {
      alert("Please fill all required fields.");
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
        .from("marketplace-images")
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
        .from("marketplace-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("marketplace_items").insert({
      seller_id: user.id,
      title,
      price: Number(price),
      category,
      description,
      image_url: imageUrl,
      sold: false,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Listing created successfully!");

    setTitle("");
    setPrice("");
    setCategory("");
    setDescription("");
    setImage(null);

    window.location.reload();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-black">Create Listing</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Item title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 rounded-xl bg-black/30 px-5 py-4 outline-none"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImage(file);
          }}
        />

        <button
          onClick={createListing}
          disabled={loading}
          className="rounded-xl bg-white py-4 font-bold text-black hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Create Listing"}
        </button>
      </div>
    </section>
  );
}