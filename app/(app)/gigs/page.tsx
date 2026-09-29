import CreateGig from "./components/CreateGig";
import GigGrid from "./components/GigGrid";

export default function GigsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-700/30 to-indigo-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
          Student Gigs
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Find Work Around Campus
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Find tutoring, moving help, coding, design, photography and other
          student jobs posted by fellow students.
        </p>
      </section>

      <CreateGig />

      <section className="space-y-6">
        <h2 className="text-3xl font-black">Latest Gigs</h2>

        <GigGrid />
      </section>
    </main>
  );
}