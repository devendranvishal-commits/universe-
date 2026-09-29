import Link from "next/link";

const liveItems = [
  {
    label: "🏈 Sports",
    title: "Flag Football Tonight",
    detail: "18 students joining • 7 PM",
  },
  {
    label: "💸 Earn",
    title: "Design Club Flyer",
    detail: "Earn $40 today",
  },
  {
    label: "🎉 Events",
    title: "AI Club Meetup",
    detail: "Starts in 30 minutes",
  },
  {
    label: "🛒 Marketplace",
    title: "MacBook Air",
    detail: "$620 • Nearby",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050816] px-6 pt-36 pb-24">
      {/* Background Glow */}
      <div className="absolute left-[-10%] top-[-10%] h-[450px] w-[450px] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-purple-300 backdrop-blur-xl">
            🌌 Built for students before Day One
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight text-white md:text-7xl">
            Your Campus.
            <br />
            Finally Connected.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-300">
            Meet friends, discover communities, earn money, find events,
            buy and sell, and build your future—all in one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/auth"
              className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              Join Universe
            </Link>

            <a
              href="#live-campus"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              Explore Campus
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-2xl font-black">120+</h3>
              <p className="text-sm text-gray-400">Communities</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-2xl font-black">2K+</h3>
              <p className="text-sm text-gray-400">Students</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-2xl font-black">500+</h3>
              <p className="text-sm text-gray-400">Events</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-2xl font-black">24/7</h3>
              <p className="text-sm text-gray-400">Live Campus</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          id="live-campus"
          className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-sm text-gray-400">
                Ohio State University
              </p>

              <h2 className="text-3xl font-black">
                Live Campus
              </h2>
            </div>

            <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-bold text-green-300">
              ● Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {liveItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-purple-500 hover:bg-white/10"
              >
                <p className="text-sm text-purple-300">
                  {item.label}
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-1 text-gray-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}