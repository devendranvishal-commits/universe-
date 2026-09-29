import CreateRide from "./components/CreateRide";
import RideGrid from "./components/RideGrid";

export default function CarpoolPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-700/30 to-cyan-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
          Campus Carpool
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Share rides. Save money.
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-300">
          Offer rides or find students traveling to the same destination.
          Reduce travel costs and make commuting easier.
        </p>
      </section>

      <CreateRide />

      <section className="space-y-6">
        <h2 className="text-3xl font-black">
          Available Rides
        </h2>

        <RideGrid />
      </section>
    </main>
  );
}