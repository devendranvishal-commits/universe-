"use client";

import Link from "next/link";
import { useState } from "react";

const interests = [
  "🏈 Sports",
  "💻 Coding",
  "🎮 Gaming",
  "🎵 Music",
  "🚀 Startups",
  "📚 Study Groups",
  "💸 Student Gigs",
  "📸 Photography",
  "🏋️ Fitness",
  "🎨 Art",
  "🏠 Housing",
  "🛒 Marketplace",
];

export default function InterestsPage() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleInterest(interest: string) {
    if (selected.includes(interest)) {
      setSelected(selected.filter((item) => item !== interest));
    } else {
      setSelected([...selected, interest]);
    }
  }

  function saveInterests() {
    localStorage.setItem("universe_interests", JSON.stringify(selected));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Step 2
        </p>

        <h1 className="mt-4 text-4xl font-black">Choose your interests</h1>

        <p className="mt-3 text-gray-400">
          Pick what you care about. Universe will personalize your campus feed.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest);

            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-2xl border p-5 text-left font-semibold transition ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-white/10 bg-black/30 text-white hover:border-purple-500 hover:bg-white/10"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>

        <Link
          href="/dashboard"
          onClick={saveInterests}
          className="mt-10 block rounded-2xl bg-white py-4 text-center font-bold text-black transition hover:scale-[1.02]"
        >
          Continue to Dashboard
        </Link>
      </div>
    </main>
  );
}