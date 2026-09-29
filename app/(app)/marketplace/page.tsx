import CreateListing from "./components/CreateListing";
import ListingGrid from "./components/ListingGrid";

export default function MarketplacePage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-700/30 to-teal-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Marketplace
        </p>

        <h1 className="mt-4 text-5xl font-black">Buy & Sell on Campus</h1>

        <p className="mt-4 text-lg text-gray-300">
          Find textbooks, electronics, furniture, bikes, and more from fellow
          students.
        </p>
      </section>

      <CreateListing />

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-black">Latest Listings</h2>
          <p className="mt-2 text-gray-400">
            Search items by title, category, or description.
          </p>
        </div>

        <ListingGrid />
      </section>
    </main>
  );
}