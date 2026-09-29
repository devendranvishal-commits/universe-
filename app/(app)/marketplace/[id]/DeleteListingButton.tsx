"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Props = {
  listingId: string;
};

export default function DeleteListingButton({ listingId }: Props) {
  const router = useRouter();

  async function deleteListing() {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this listing?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", listingId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Listing deleted successfully.");

    router.push("/marketplace");
    router.refresh();
  }

  return (
    <button
      onClick={deleteListing}
      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
    >
      <Trash2 size={18} />
      Delete Listing
    </button>
  );
}