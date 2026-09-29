"use client";

import Link from "next/link";

type Props = {
  listingId: string;
};

export default function EditListingButton({ listingId }: Props) {
  return (
    <Link
      href={`/marketplace/${listingId}/edit`}
      className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
    >
      Edit Listing
    </Link>
  );
}