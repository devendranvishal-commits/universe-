import Link from "next/link";

const universities = [
  "Ohio State University",
  "University of Texas at Arlington",
  "University of Michigan",
  "University of California, Los Angeles",
  "New York University",
];

export default function UniversityPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Step 1
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Choose your university
        </h1>

        <p className="mt-3 text-gray-400">
          Universe will personalize your campus experience.
        </p>

        <div className="mt-8 space-y-4">
          {universities.map((school) => (
            <Link
              key={school}
              href="/interests"
              className="block rounded-2xl border border-white/10 bg-black/30 p-5 font-semibold transition hover:border-purple-500 hover:bg-white/10"
            >
              {school}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}