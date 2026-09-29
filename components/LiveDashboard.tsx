const liveItems = [
  {
    category: "Belong",
    title: "Flag football tonight",
    detail: "12 students joined • Starts at 7 PM",
    action: "Join",
  },
  {
    category: "Earn",
    title: "Design a club poster",
    detail: "$40 • Due today",
    action: "Apply",
  },
  {
    category: "Live",
    title: "MacBook Air listed",
    detail: "$620 • 0.3 miles away",
    action: "View",
  },
  {
    category: "Grow",
    title: "Startup team looking",
    detail: "Needs a finance student",
    action: "Connect",
  },
];

const stats = [
  { label: "Students active", value: "1,284" },
  { label: "Communities", value: "128" },
  { label: "Gigs today", value: "24" },
];

export default function LiveDashboard() {
  return (
    <section className="px-6 pb-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
            Live Campus
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            Your campus, alive in real time.
          </h2>
        </div>

        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
            <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-gray-400">Ohio State University</p>
                <h3 className="text-3xl font-black">Tonight around campus</h3>
              </div>

              <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-bold text-green-300">
                ● Live now
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"
                >
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {liveItems.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/10 md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-purple-300">
                      {item.category}
                    </p>
                    <h4 className="mt-1 text-xl font-bold">{item.title}</h4>
                    <p className="mt-1 text-sm text-gray-400">{item.detail}</p>
                  </div>

                  <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:scale-105">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}