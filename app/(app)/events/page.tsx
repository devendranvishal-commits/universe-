import CreateEvent from "./components/CreateEvent";
import EventGrid from "./components/EventGrid";

export default function EventsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 to-pink-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Campus Events
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Discover Events Around Campus
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Create and explore student events, workshops, club meetings, and
          campus activities.
        </p>
      </section>

      <CreateEvent />

      <section className="space-y-6">
        <h2 className="text-3xl font-black">Upcoming Events</h2>

        <EventGrid />
      </section>
    </main>
  );
}