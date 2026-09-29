"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Props = {
  listingId: string;
};

export default function MarkSoldButton({ listingId }: Props) {
  const router = useRouter();

  async function markAsSold() {
    const confirmSold = confirm("Mark this listing as sold?");

    if (!confirmSold) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("marketplace_items")
      .update({ sold: true })
      .eq("id", listingId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Listing marked as sold!");
    router.push("/marketplace");
    router.refresh();
  }

  return (
    <button
      onClick={markAsSold}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
    >
      <CheckCircle size={18} />
      Mark as Sold
    </button>
  );
}