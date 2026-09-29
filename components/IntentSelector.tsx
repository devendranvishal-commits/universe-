"use client";

import { useState } from "react";

const options = {
  friends: {
    label: "Find Friends",
    title: "Find your people faster.",
    items: [
      "Join interest-based communities",
      "Meet students in your dorm or major",
      "Find sports, music, gaming, and culture groups",
    ],
  },
  earn: {
    label: "Earn Money",
    title: "Make money using your skills.",
    items: [
      "Find student gigs",
      "Offer tutoring or design services",
      "Discover campus and remote jobs",
    ],
  },
  grow: {
    label: "Get Internship",
    title: "Build your future early.",
    items: [
      "Track internships",
      "Find career events",
      "Meet mentors and startup teams",
    ],
  },
  housing: {
    label: "Find Housing",
    title: "Live better near campus.",
    items: [
      "Find roommates",
      "Discover subleases",
      "Compare housing near campus",
    ],
  },
  startup: {
    label: "Build Startup",
    title: "Find builders around you.",
    items: [
      "Meet co-founders",
      "Join startup communities",
      "Find designers, coders, and business partners",
    ],
  },
};

export default function IntentSelector() {
  const [selected, setSelected] = useState<keyof typeof options>("friends");
  const current = options[selected];

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Personalized Universe
        </p>

        <h2 className="mt-4 text-4xl font-black md:text-6xl">
          What do you want today?
        </h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {Object.entries(options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelected(key as keyof typeof options)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                selected === key
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-3xl font-bold">{current.title}</h3>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {current.items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-gray-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}