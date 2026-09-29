import CreateHousing from "./components/CreateHousing";
import HousingGrid from "./components/HousingGrid";

export default function HousingPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-700/30 to-green-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Housing
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Find Your Next Home
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Browse apartments, rooms, roommates, and subleases from fellow
          students.
        </p>
      </section>

      <CreateHousing />

      <section className="space-y-6">
        <h2 className="text-3xl font-black">
          Latest Housing Listings
        </h2>

        <HousingGrid />
      </section>
    </main>
  );
}