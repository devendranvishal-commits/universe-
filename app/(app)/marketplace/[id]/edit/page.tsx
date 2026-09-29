"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../../lib/client";

export default function EditListingPage() {
  const params = useParams();
  const listingId = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadListing();
  }, []);

  async function loadListing() {
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("id", listingId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setTitle(data.title || "");
    setPrice(String(data.price || ""));
    setCategory(data.category || "");
    setDescription(data.description || "");
    setCurrentImageUrl(data.image_url || "");
  }

  async function updateListing() {
    setSaving(true);

    let finalImageUrl = currentImageUrl;

    if (newImage) {
      const fileExt = newImage.name.split(".").pop();
      const fileName = `${listingId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("marketplace-images")
        .upload(fileName, newImage, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("marketplace-images")
        .getPublicUrl(fileName);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("marketplace_items")
      .update({
        title,
        price: Number(price),
        category,
        description,
        image_url: finalImageUrl,
      })
      .eq("id", listingId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = `/marketplace/${listingId}?refresh=${Date.now()}`;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="text-4xl font-black">Edit Listing</h1>

        {(previewUrl || currentImageUrl) ? (
          <img
            src={previewUrl || currentImageUrl}
            alt="Listing image"
            className="mt-8 h-64 w-full rounded-3xl object-cover"
          />
        ) : (
          <div className="mt-8 flex h-64 items-center justify-center rounded-3xl bg-black/30 text-gray-400">
            No current image
          </div>
        )}

        <div className="mt-8 grid gap-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="min-h-40 rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="mb-3 font-bold">Change Image</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  setNewImage(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />

            {newImage && (
              <p className="mt-3 text-sm text-green-300">
                New image selected: {newImage.name}
              </p>
            )}
          </div>

          <button
            onClick={updateListing}
            disabled={saving}
            className="rounded-2xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </main>
  );
}