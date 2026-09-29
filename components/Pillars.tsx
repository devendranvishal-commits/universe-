const pillars = [
  {
    title: "Belong",
    subtitle: "Find your people",
    text: "Communities, sports, clubs, study groups, culture groups, and meaningful connections.",
  },
  {
    title: "Earn",
    subtitle: "Make money",
    text: "Student gigs, tutoring, campus jobs, remote work, and paid student services.",
  },
  {
    title: "Grow",
    subtitle: "Build your future",
    text: "Internships, mentors, startup teams, research, hackathons, and career opportunities.",
  },
  {
    title: "Live",
    subtitle: "Experience campus",
    text: "Marketplace, housing, carpool, events, discounts, food alerts, and live campus activity.",
  },
];

export default function Pillars() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          The Universe System
        </p>

        <h2 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">
          Everything students need to belong, earn, grow, and live better.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:bg-white/10"
            >
              <p className="text-sm text-purple-300">{pillar.subtitle}</p>
              <h3 className="mt-3 text-3xl font-black">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}